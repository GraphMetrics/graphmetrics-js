import { Details } from '@graphmetrics/client';

export interface FieldMessage {
  typeName: string;
  fieldName: string;
  returnType: string;
  error?: Error | null;
  duration: number;
  client: Details;
}
