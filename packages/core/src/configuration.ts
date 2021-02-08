import { Logger } from '@graphmetrics/logger';
import { Extractor } from '@graphmetrics/client';

export interface Configuration {
  apiKey: string;
  serverVersion?: string;
  clientExtractor?: Extractor;
  logger?: Logger;
  advanced?: AdvancedConfiguration;
}

export interface AdvancedConfiguration {
  endpoint?: string;
  http?: boolean;
  debug?: boolean;
  stopTimeout?: number;
}
