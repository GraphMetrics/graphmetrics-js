import crypto from 'crypto';
import { DocumentNode, OperationDefinitionNode } from 'graphql';
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

export function operationType(
  ast: DocumentNode,
  operationName: string,
): string | null {
  const definition = ast.definitions.find((d) => {
    if (d.kind !== 'OperationDefinition') return false;
    return d.name?.value === undefined || d.name?.value === operationName;
  });
  if (!definition) return null;
  return (definition as OperationDefinitionNode).operation;
}

export function operationHash(operation: string): string {
  return crypto.createHash('sha256').update(operation).digest('hex');
}
