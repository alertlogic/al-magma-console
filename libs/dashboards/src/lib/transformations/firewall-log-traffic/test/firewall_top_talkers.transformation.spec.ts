import { ZeroStateReason } from '@al/ng-visualizations-components';
import { topTalkers } from '../firewall_top_talkers.transformation';

describe('Transformation Test Suite: Top Talkers', () => {
  describe('When a response is passed in that has a value greater than 0', () => {
    it('should return the correct response object', () => {
      const response = [
        { rows: [["10.110.18.200", 673]], column_info: [ {type: "varchar", name: "ip"}, {type: "int8", name: "connections_count"} ] },
        { rows: [[39456]], column_info: [ {type: "int8", name: "total_connections_count"} ] }
      ];
      const expected = {
        headers: [
            { name: 'Internal IP', field: 'ip', class: 'left' },
            { name: 'Connections', field: 'connections_count', class: 'right' },
            { name: '% of Total', field: 'percentage_connections_count', class: 'right' }
        ],
        body: [{
          ip: "10.110.18.200",
          connections_count: '673',
          percentage_connections_count: '1.71%'
        }]
      };

      expect(topTalkers(response)).toEqual(expected);
    });
  });
  describe('When a response is passed in that has a value equal 0', () => {
    it('should return the a zero state object', () => {
      const response = [
        { rows: [], column_info: [ {type: "varchar", name: "ip"}, {type: "int8", name: "connections_count"} ] },
        { rows: [], column_info: [ {type: "int8", name: "total_connections_count"} ] }
      ];
      const expected = {
        nodata: true,
        reason: ZeroStateReason.Zero
      };

      expect(topTalkers(response)).toEqual(expected);
    });
  });
});
