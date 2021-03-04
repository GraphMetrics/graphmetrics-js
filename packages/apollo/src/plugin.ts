import {
  ApolloServerPlugin,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextWillSendResponse,
} from 'apollo-server-plugin-base';
import {
  Aggregator,
  client as extractor,
  Configuration,
  FieldMessage,
  logging,
  operationHash,
  OperationMessage,
  operationSignature,
  operationType,
} from '@graphmetrics/core';

const NS_PER_SEC = 1e9;

type StoppableApolloServerPlugin<Context> = ApolloServerPlugin<Context> & {
  stop: () => Promise<void>;
};

export function GraphMetrics<Context = any>(
  config: Configuration<Context>,
): StoppableApolloServerPlugin<Context> {
  const aggregator = new Aggregator(config);
  const logger = config.logger ?? logging.defaultLogger(config.advanced?.debug);

  return {
    requestDidStart(requestContext) {
      const operationStartTime = process.hrtime();
      let client: extractor.Details = {
        name: '',
        version: '',
      };
      if (config.clientExtractor) {
        client = config.clientExtractor(requestContext.context);
      } else if (requestContext.request.http) {
        client = extractor.apolloHeaders(requestContext.request.http as any);
      }
      let signature: string | null = null;
      let type: string | null = null;
      let hash: string | null = null;
      let hasErrors = false;

      /*
       * Due to backward compatibility, sometimes `willSendResponse`
       * is not called so we need to call `didEnd` in `didEncounterErrors`
       * too to be sure.
       */
      let done = false;
      function didEnd(
        requestContext:
          | GraphQLRequestContextWillSendResponse<Context>
          | GraphQLRequestContextDidEncounterErrors<Context>,
      ) {
        if (done) return;
        done = true;

        // For now we ignore the operations that fail to parse
        if (!signature || !hash) return;
        if (!type) {
          logger.warn('Unable to extract type from AST');
          return;
        }

        const operationDuration = process.hrtime(operationStartTime);
        const duration =
          operationDuration[0] * NS_PER_SEC + operationDuration[1];
        const message: OperationMessage = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          name: requestContext.operationName!,
          type,
          hash,
          signature,
          hasErrors,
          duration,
          client,
        };

        aggregator.pushOperation(message);
      }

      return {
        didResolveOperation(requestContext) {
          signature = operationSignature(
            requestContext.document,
            requestContext.operationName ?? '',
          );
          type = operationType(
            requestContext.document,
            requestContext.operationName ?? '',
          );
          hash = operationHash(signature);
        },
        executionDidStart() {
          return {
            willResolveField({ info }) {
              const fieldStartTime = process.hrtime();

              return (error) => {
                if (error) hasErrors = true;
                const fieldDuration = process.hrtime(fieldStartTime);
                const duration =
                  fieldDuration[0] * NS_PER_SEC + fieldDuration[1];
                const message: FieldMessage = {
                  fieldName: info.fieldName,
                  typeName: info.parentType.name,
                  returnType: info.returnType.toString(),
                  error,
                  duration,
                  client,
                };
                aggregator.pushField(message);
              };
            },
          };
        },
        didEncounterErrors(requestContext) {
          didEnd(requestContext);
        },
        willSendResponse(requestContext) {
          didEnd(requestContext);
        },
      };
    },
    serverWillStart() {
      return {
        serverWillStop() {
          return aggregator.stop();
        },
      };
    },
    stop() {
      return aggregator.stop();
    },
  };
}
