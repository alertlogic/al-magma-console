import { ZeroStateReason } from '@al/ng-visualizations-components';
import { firewallTopProtocols } from '../firewall_top_protocols.transformation';


describe('Transformation Test Suite: Top Applications', () => {
  describe('When a response is passed in', () => {
    it('should return the correct response object', () => {
      const response = {
        rows: [
          ['name1', 10],
          ['name2', 10]
        ]
      };

      const expected = {
        dateOptions: ['name1', 'name2'],
        description: "Connections",
        inverted: true,
        yAxisType: "linear",
        tooltipString: '{{name}}: {{value:0dp}}',
        series: [{
          type: "column",
          data: [
            {y: 10, className: 'al-blue-400'},
            {y: 10, className: 'al-blue-400'}
          ],
          showInLegend: false
        }]
      };

      expect(firewallTopProtocols(response)).toEqual(expected);
    });
  });
  describe('When the response returns a total count of 0', () => {
    it('should return a zerostate object', () => {
      const response = {
        rows: []
      };

      const expected = {
        nodata: true,
        reason: ZeroStateReason.Zero
      };

      expect(firewallTopProtocols(response)).toEqual(expected);
    });
  });
});
