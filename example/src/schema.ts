/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeExecutableSchema } from 'apollo-server-express';

import resolvers from './resolvers';
import typeDefs from './typeDefs';

const schema: any = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
