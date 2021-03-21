import { Details } from '@graphmetrics/client';

export interface FieldMessage {
  typeName: string;
  fieldName: string;
  returnType: string;
  error?: Error | null;
  duration: number;
  client: Details;
}

export interface OperationMessage {
  name: string;
  type: string;
  hash: string;
  signature: string;
  hasErrors: boolean;
  duration: number;
  client: Details;
}
