export interface Details {
  name: string;
  version: string;
}

export type Extractor<Context> = (ctx: Context) => Details;
