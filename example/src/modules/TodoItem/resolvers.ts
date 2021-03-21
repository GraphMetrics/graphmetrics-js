import { Context } from '../../context';

import { findList } from '../TodoList/actions';

type TodoItem = {
  id: string;
  listId: string;
  content: string;
};

const resolvers = {
  TodoItem: {
    list: (parent: TodoItem, _args: {}, ctx: Context) => {
      return findList(parent.listId, ctx);
    },
  },
};

export default resolvers;
