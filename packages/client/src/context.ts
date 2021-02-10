import { Details } from './interface';

export type Context<BaseContext> = BaseContext & { client: Details };

export function contextExtractor<BaseContext>(
  ctx: Context<BaseContext>,
): Details {
  return ctx.client;
}
