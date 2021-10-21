import { vulnCountChange } from '../vuln_count_change.transformation';

describe('Transformation Test Suite: Vulnerability Count Change', () => {
  describe('When a response is passed in that imndicates an increase', () => {
    it('should return the correct response object indicating bad', () => {
      const response = [
        { rows: [[2, 3, 4, 5]] },
        { rows: [[3, 4, 5, 6]] }
      ];
      const expected = {
        primaryCount: 3,
        changeCount: 1,
        changeType: "bad"
      };

      expect(vulnCountChange(response)).toEqual(expected);
    });
  });

  describe('When a response is passed in that imndicates an decrease', () => {
    it('should return the correct response object indicating bad', () => {
      const response = [
        { rows: [[4, 3, 4, 5]] },
        { rows: [[3, 4, 5, 6]] }
      ];
      const expected = {
        primaryCount: 3,
        changeCount: -1,
        changeType: "good"
      };

      expect(vulnCountChange(response)).toEqual(expected);
    });
  });

  describe('When a response is passed in that has no rows', () => {
    it('should return the correct response object indicating zero change and good', () => {
      const response = [
        { rows: [] },
        { rows: [] }
      ];
      const expected = {
        primaryCount: 0,
        changeCount: 0,
        changeType: "good"
      };

      expect(vulnCountChange(response)).toEqual(expected);
    });
  });
});
