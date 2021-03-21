import { Context } from '../../context';
import { findUserLists } from '../../modules/TodoList/actions';
import { findUser } from './actions';

type User = {
  id: string;
  name: string;
};

const resolvers = {
  User: {
    lists: (parent: User, _args: {}, ctx: Context) => {
      return findUserLists(parent.id, ctx);
    },
  },
  Query: {
    user: (_parent: {}, args: { id: string }, ctx: Context) => {
      return findUser(args.id, ctx);
    },
  },
};

export default resolvers;
