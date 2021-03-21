import { Context } from '../../context';

import { findListItems } from '../TodoItem/actions';

type TodoList = {
  id: string;
};

const resolvers = {
  TodoList: {
    items: (parent: TodoList, _args: {}, ctx: Context) => {
      return findListItems(parent.id, ctx);
    },
  },
};

export default resolvers;
