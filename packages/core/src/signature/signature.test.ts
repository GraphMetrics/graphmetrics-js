import { default as gql, disableFragmentWarnings } from 'graphql-tag';
import { operationHash, operationSignature } from './signature';

describe('Signature tests', () => {
  disableFragmentWarnings();

  it('can produce a stable siganture', () => {
    const operation = gql`
      fragment Test on Query {
        field(id: "1", x: 1, y: 2.3)
      }
      fragment OtherTest on Query {
        secondField(input: $input)
      }
      query MyQuery {
        ...Test
      }
      query MyOtherQuery {
        ...Test
      }
    `;
    const expected = `query MyQuery {
  ...Test
}

fragment Test on Query {
  field(id: "", x: 0, y: 0)
}
`;

    const signature = operationSignature(operation, 'MyQuery');
    expect(signature).toEqual(expected);
  });

  it('can produce a stable hash', () => {
    const expected =
      '4307cf751b7b51ef6bbf29e8b6f8d6944a366d141dfb1032796b512fc11813bc';
    const hash = operationHash('{ myField }');
    expect(hash).toEqual(expected);
  });
});
