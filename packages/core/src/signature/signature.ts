import crypto from 'crypto';
import { DocumentNode } from 'graphql';
import {
  dropUnusedOperationsAndFragments,
  hideLiterals,
  prettyPrint,
} from './transforms';

export function operationSignature(
  ast: DocumentNode,
  operationName: string,
): string {
  return prettyPrint(
    hideLiterals(dropUnusedOperationsAndFragments(ast, operationName)),
  );
}

export function operationHash(operation: string): string {
  return crypto.createHash('sha256').update(operation).digest('hex');
}
