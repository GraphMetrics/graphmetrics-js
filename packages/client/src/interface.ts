/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Details {
  name: string;
  version: string;
}

export type Extractor = <Context = any>(ctx: Context) => Details;
