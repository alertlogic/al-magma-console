import { averageTriScore } from '../average_tri_score.transformation';


describe('Transformation Test Suite: Average TRI Score', () => {
  describe('When a response is passed in', () => {
    it('should return the correct primary count', () => {
      const response = {
        rows: [
          [5, 4, 3, 2, 1]
        ]
      };
      const expected = {
        primaryCount: 5
      };
      expect(averageTriScore(response)).toEqual(expected);
    });
  });

  describe('When the response returns no rows', () => {
    it('should return a primary count of 0', () => {
      const response = {
        rows: []
      };
      const expected = {
        primaryCount: 0
      };
      expect(averageTriScore(response)).toEqual(expected);
    });
  });
});
