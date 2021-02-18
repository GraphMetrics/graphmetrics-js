import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import {
  Aggregator,
  client as extractor,
  Configuration,
} from '@graphmetrics/core';
import { FieldMessage } from '@graphmetrics/core/dist/messages';

const NS_PER_SEC = 1e9;

type StoppableApolloServerPlugin<Context> = ApolloServerPlugin<Context> & {
  stop: () => Promise<void>;
};

export function GraphMetrics<Context = any>(
  config: Configuration<Context>,
): StoppableApolloServerPlugin<Context> {
  const aggregator = new Aggregator(config);

  return {
    requestDidStart(requestContext) {
      let client: extractor.Details = {
        name: '',
        version: '',
      };
      if (config.clientExtractor) {
        client = config.clientExtractor(requestContext.context);
      } else if (requestContext.request.http) {
        client = extractor.apolloHeaders(requestContext.request.http as any);
      }

      return {
        executionDidStart() {
          return {
            willResolveField({ info }) {
              const fieldStartTime = process.hrtime();

              return (error) => {
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
