import { passthrough } from '../passthrough.transformation';

describe('Transformation Test Suite: Passthrough', () => {
  describe('Given any supplied mock object', () => {
    it('should return exactly what it is passed', () => {
      const response: any = {
        value1: 1,
        value2: 2
      };
      expect(passthrough(response)).toEqual(response);
    });
  });
});
