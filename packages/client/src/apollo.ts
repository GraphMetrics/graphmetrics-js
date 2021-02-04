/* eslint-disable @typescript-eslint/no-explicit-any */

import { IncomingHttpHeaders } from 'http';

import { Context } from './context';

type Request = {
  headers: IncomingHttpHeaders;
};

export function apolloContext<BaseContext = any>(
  ctx: BaseContext,
  req: Request,
): Context<BaseContext> {
  let name = '';
  const rawName = req.headers['apollographql-client-name'];
  if (rawName) {
    if (Array.isArray(rawName)) {
      name = rawName[0];
    } else {
      name = rawName;
    }
  }

  let version = '';
  const rawVersion = req.headers['apollographql-client-version'];
  if (rawVersion) {
    if (Array.isArray(rawVersion)) {
      version = rawVersion[0];
    } else {
      version = rawVersion;
    }
  }

  return {
    ...ctx,
    client: {
      name,
      version,
    },
  };
}
