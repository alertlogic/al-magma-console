import { externalVulnCountChange } from '../external_vuln_count_change.transformation';

describe('Transformation Test Suite: External Vulnerability Count Change', () => {
  describe('When a response is passed in that has an increase', () => {
    it('should return the correct response object with change type of bad', () => {
      const response = [
        {rows: [[0, 0, 8, 0]]},
        {rows: [[0, 0, 12, 0]]},
      ];

      const expected = {
        primaryCount: 12,
        changeCount: 4,
        changeType: 'bad'
      };

      expect(externalVulnCountChange(response)).toEqual(expected);
    });
  });
  describe('When a response is passed in that has an decrease', () => {
    it('should return the correct response object with change type of good', () => {
      const response = [
        {rows: [[0, 0, 12, 0]]},
        {rows: [[0, 0, 8, 0]]},
      ];

      const expected = {
        primaryCount: 8,
        changeCount: -4,
        changeType: 'good'
      };

      expect(externalVulnCountChange(response)).toEqual(expected);
    });
  });
  describe('When a response is passed in that has no rows', () => {
    it('should return the correct response object with change type of good', () => {
      const response = [
        {rows: []},
        {rows: []},
      ];

      const expected = {
        primaryCount: 0,
        changeCount: 0,
        changeType: 'good'
      };

      expect(externalVulnCountChange(response)).toEqual(expected);
    });
  });
});
