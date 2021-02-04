/* eslint-disable @typescript-eslint/no-explicit-any */

import { Details } from './interface';

export type Context<BaseContext = any> = BaseContext & { client: Details };

export function contextExtractor<BaseContext = any>(
  ctx: Context<BaseContext>,
): Details {
  return ctx.client;
}
