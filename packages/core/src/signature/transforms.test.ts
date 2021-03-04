import { default as gql, disableFragmentWarnings } from 'graphql-tag';
import {
  dropUnusedOperationsAndFragments,
  hideLiterals,
  prettyPrint,
} from './transforms';

describe('Signature transforms tests', () => {
  disableFragmentWarnings();

  it('hides literals', () => {
    const operation = gql`
      fragment Test on Query {
        secondField(input: { id: "2" })
      }
      query {
        a: field(id: "1", x: 1, y: 2.3)
        b: field(id: $id, x: $x, y: $y)
        ...Test
        thirdField(input: [{ id: "3" }])
        fourthField {
          fieldTwo(id: "5")
        }
      }
    `;
    const expected = `{
  a: field(id: "", x: 0, y: 0)
  b: field(id: $id, x: $x, y: $y)
  ...Test
  thirdField(input: [])
  fourthField {
    fieldTwo(id: "")
  }
}

fragment Test on Query {
  secondField(input: {})
}
`;

    const doc = hideLiterals(operation);
    const actual = prettyPrint(doc);

    expect(actual).toEqual(expected);
  });

  it('drops unused fragments', () => {
    const operation = gql`
      fragment Test on Query {
        field(id: "1", x: 1, y: 2.3)
      }
      fragment Unused on Query {
        secondField(input: $input)
      }
      query {
        ...Test
      }
    `;
    const expected = `{
  ...Test
}

fragment Test on Query {
  field(id: "1", x: 1, y: 2.3)
}
`;

    const doc = dropUnusedOperationsAndFragments(operation, '');
    const actual = prettyPrint(doc);

    expect(actual).toEqual(expected);
  });

  it('drops unused operations', () => {
    const operation = gql`
      query FirstOperation {
        field(id: "1", x: 1, y: 2.3)
      }
      query SecondOperation {
        field(id: "1", x: 1, y: 2.3)
      }
    `;
    const expected = `query SecondOperation {
  field(id: "1", x: 1, y: 2.3)
}
`;

    const doc = dropUnusedOperationsAndFragments(operation, 'SecondOperation');
    const actual = prettyPrint(doc);

    expect(actual).toEqual(expected);
  });
});
