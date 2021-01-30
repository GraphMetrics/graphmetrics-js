export interface Logger {
  debug(msg: string, metadata: Record<string, unknown>): void;
  info(msg: string, metadata: Record<string, unknown>): void;
  warn(msg: string, metadata: Record<string, unknown>): void;
  error(msg: string, metadata: Record<string, unknown>): void;
}
