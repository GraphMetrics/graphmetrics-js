//
// Copyrights are respective of each contributor listed at the beginning of the definition file.
// Licensed under the MIT license.
// See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/b2655e988996604b9c1c2cc9fc0813a895275e53/types/pino/index.d.ts for details.
//

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unused-vars */

export = P;

declare namespace P {
  interface LogFn {
    <T extends object>(obj: T, msg?: string, ...args: any[]): void;
    (msg: string, ...args: any[]): void;
  }

  type Logger = BaseLogger & { [key: string]: LogFn };

  interface BaseLogger {
    error: LogFn;
    warn: LogFn;
    info: LogFn;
    debug: LogFn;
  }
}
