/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ClientDetails {
  name: string;
  version: string;
}

export type ClientExtractor<Context = any> = (
  context: Context,
) => ClientDetails;
