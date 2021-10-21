import { ZeroStateReason } from '@al/ng-visualizations-components';
import { triMostVulnerableHosts } from '../tri_most_vulnerable_hosts.transformation';

describe('Transformation Test Suite: Most Vulnerable Hosts', () => {
  describe('When a response is passed in that has a value greater than 0', () => {
    it('should return the correct response object', () => {
      const response = {
        rows: [
          [1, 2, 3, 4]
        ]
      };
      const expected = {
        headers: [
          { name: 'Host Name', field: 'host', class: 'left' },
          { name: 'Deployment', field: 'deployment', class: 'left' },
          { name: 'TRI Score', field: 'tri', class: 'right' },
          { name: 'Distinct Vulns', field: 'vulns', class: 'right' }
        ],
        body: [{
          host: 2,
          deployment: 1,
          tri: "3.00",
          vulns: 4
        }]
      };

      expect(triMostVulnerableHosts(response)).toEqual(expected);
    });
  });
  describe('When a response is passed in that has a value equal 0', () => {
    it('should return the a zero state object', () => {
      const response = {rows: []};
      const expected = {
        nodata: true,
        reason: ZeroStateReason.Zero
      };

      expect(triMostVulnerableHosts(response)).toEqual(expected);
    });
  });
});
