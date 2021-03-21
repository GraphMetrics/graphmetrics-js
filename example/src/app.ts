/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphMetrics, logging } from '@graphmetrics/apollo';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import { createContext, Context } from './context';
import logger from './context/logger';

export const app: any = express();

const metrics = GraphMetrics<Context>({
  apiKey: 'imtbk.dXyWl4qJHzgwTWcrV3lLojS6RCyQqLt5Zn925lf77hBXvno2nzv5xrAmCKB', // Replace by you own key!
  serverVersion: '0.1.0',
  logger: logging.fromPino(logger),
});

const apollo = new ApolloServer({
  schema,
  context: createContext,
  subscriptions: false,
  plugins: [metrics],
  // Uncomment the following if using apollo <2.21.2
  // stopOnTerminationSignals: false,
});

apollo.applyMiddleware({
  app,
  cors: false,
  disableHealthCheck: true,
});

// Uncomment the following if using apollo <2.21.2
// const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
// signals.forEach((signal) => {
//   const handler: NodeJS.SignalsListener = async () => {
//     await apollo.stop();
//     process.exit(0);
//   };
//   process.on(signal, handler);
// });
