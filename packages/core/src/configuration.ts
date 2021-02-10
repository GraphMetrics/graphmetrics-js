import { Logger } from '@graphmetrics/logger';
import { Extractor } from '@graphmetrics/client';

export interface Configuration<Context = any> {
  apiKey: string;
  serverVersion?: string;
  clientExtractor?: Extractor<Context>;
  logger?: Logger;
  advanced?: AdvancedConfiguration;
}

export interface AdvancedConfiguration {
  endpoint?: string;
  http?: boolean;
  debug?: boolean;
  stopTimeout?: number;
}
