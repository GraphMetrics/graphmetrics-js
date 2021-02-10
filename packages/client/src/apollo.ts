import { IncomingHttpHeaders } from 'http';

import { Context } from './context';
import { Details } from './interface';

type Request = {
  headers: IncomingHttpHeaders;
};

export function apolloContext<BaseContext>(
  ctx: BaseContext,
  req: Request,
): Context<BaseContext> {
  return {
    ...ctx,
    client: apolloHeaders(req),
  };
}

export function apolloHeaders(req: Request): Details {
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
    name,
    version,
  };
}
