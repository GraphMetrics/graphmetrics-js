import pino from 'pino';
import logger from './logger';

export type Context = {
  logger: pino.Logger;
};

export function createContext(): Context {
  return {
    logger,
  };
}
