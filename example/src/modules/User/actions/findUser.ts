import { Context } from '../../../context';

export default async (id: string, ctx: Context) => {
  return { id, name: 'Bruce' };
};
