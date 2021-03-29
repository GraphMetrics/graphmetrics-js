import { IncomingHttpHeaders } from 'http';

import { Context } from './context';
import { Details } from './interface';

const CLIENT_NAME_HEADER = 'apollographql-client-name';
const CLIENT_VERSION_HEADER = 'apollographql-client-version';

interface Headers {
  get(name: string): string | null;
}

type Request = {
  headers: IncomingHttpHeaders | Headers;
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
  // Extract name
  let name = '';
  let rawName: string | string[] | null = '';
  if (typeof req.headers.get === 'function') {
    rawName = req.headers.get(CLIENT_NAME_HEADER);
  } else {
    rawName = req.headers[CLIENT_NAME_HEADER];
  }

  if (rawName) {
    if (Array.isArray(rawName)) {
      name = rawName[0];
    } else {
      name = rawName;
    }
  }

  // Extract version
  let version = '';
  let rawVersion: string | string[] | null = '';
  if (typeof req.headers.get === 'function') {
    rawVersion = req.headers.get(CLIENT_VERSION_HEADER);
  } else {
    rawName = req.headers[CLIENT_VERSION_HEADER];
  }

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
