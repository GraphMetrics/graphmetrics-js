import {
  DocumentNode,
  FloatValueNode,
  IntValueNode,
  ListValueNode,
  ObjectValueNode,
  print,
  separateOperations,
  StringValueNode,
  visit,
} from 'graphql';

export function hideLiterals(ast: DocumentNode): DocumentNode {
  return visit(ast, {
    IntValue(node: IntValueNode): IntValueNode {
      return { ...node, value: '0' };
    },
    FloatValue(node: FloatValueNode): FloatValueNode {
      return { ...node, value: '0' };
    },
    StringValue(node: StringValueNode): StringValueNode {
      return { ...node, value: '', block: false };
    },
    ListValue(node: ListValueNode): ListValueNode {
      return { ...node, values: [] };
    },
    ObjectValue(node: ObjectValueNode): ObjectValueNode {
      return { ...node, fields: [] };
    },
  });
}

export function sortOperationsAndFragments(ast: DocumentNode): DocumentNode {
  return {
    ...ast,
    definitions: ast.definitions.slice().sort((a, b) => {
      // Reverse order for kind so operations are before fragments
      let result = Number(a.kind < b.kind) - Number(a.kind > b.kind);
      if (result != 0) return result;
      result =
        // @ts-expect-error This is fine because we only sort ExecutableDefinitionNode
        Number(a.name?.value > b.name?.value) -
        // @ts-expect-error
        Number(b.name?.value < a.name?.value);
      return result;
    }),
  };
}

export function dropUnusedOperationsAndFragments(
  ast: DocumentNode,
  operationName: string,
): DocumentNode {
  const separated = separateOperations(ast)[operationName];
  if (!separated) return ast;
  return separated;
}

export function prettyPrint(ast: DocumentNode): string {
  return print(sortOperationsAndFragments(ast));
}
