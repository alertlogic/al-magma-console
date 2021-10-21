import { unprotectedNodes} from '../unprotected_nodes.transformation';

describe('Transformation Test Suite: Unprotected Nodes', () => {
  describe('Given an assets query response object', () => {
    it('should return the value in the first item of the first assets array item', () => {
      const response = {
        assets: [[146]]
      };
      expect(unprotectedNodes(response)).toEqual({primaryCount: 146});
    });
  });
});
