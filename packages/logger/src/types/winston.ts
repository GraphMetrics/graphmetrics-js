//
// Copyright (c) 2010 Charlie Robbins.
// Licensed under the MIT license.
// See https://github.com/winstonjs/winston/blob/2625f60c5c85b8c4926c65e98a591f8b42e0db9a/index.d.ts for details.
//

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */

declare namespace winston {
  type LogCallback = (
    error?: any,
    level?: string,
    message?: string,
    meta?: any,
  ) => void;

  interface LeveledLogMethod {
    (message: string, callback: LogCallback): Logger;
    (message: string, meta: any, callback: LogCallback): Logger;
    (message: string, ...meta: any[]): Logger;
    (message: any): Logger;
    (infoObject: object): Logger;
  }

  interface Logger {
    error: LeveledLogMethod;
    warn: LeveledLogMethod;
    info: LeveledLogMethod;
    debug: LeveledLogMethod;
  }
}

export = winston;
