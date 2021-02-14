import { IMiddlewareFunction } from 'graphql-middleware';
import { Aggregator } from '@graphmetrics/core';

interface MiddlewareConfiguration {
  aggregator: Aggregator;
}

export function graphmetricsMiddleware(
  config: MiddlewareConfiguration,
): IMiddlewareFunction {
  return async (resolve, root, args, context, info) => {
    const result = await resolve(root, args, context, info);

    return result;
  };
}
