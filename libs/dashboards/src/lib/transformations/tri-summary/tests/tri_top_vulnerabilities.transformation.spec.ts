import { ZeroStateReason } from '@al/ng-visualizations-components';
import { triTopVulnerabilities } from '../tri_top_vulnerabilities.transformation';

describe('Transformation Test Suite: TRI Top Vulnerabilities', () => {
  describe('When a response is passed in that has a value greater than 0', () => {
    it('should return the correct response object', () => {
      const response = {
        rows: [
          ["name", 1, 2]
        ]
      };
      const expected = {
        headers: [
          { name: 'Vulnerability Name', field: 'name', class: 'left' },
          { name: 'TRI Score', field: 'tri', class: 'right' },
          { name: 'Impacted Assets', field: 'assets', class: 'right' }
        ],
        body: [{
          name: "name",
          tri: "1.00",
          assets: 2
        }]
      };

      expect(triTopVulnerabilities(response)).toEqual(expected);
    });
  });
  describe('When a response is passed in that has a value equal 0', () => {
    it('should return the a zero state object', () => {
      const response = {rows: []};
      const expected = {
        nodata: true,
        reason: ZeroStateReason.Zero
      };

      expect(triTopVulnerabilities(response)).toEqual(expected);
    });
  });
});
