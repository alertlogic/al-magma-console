import { firewallLogVolumeTrends } from '../firewall_log_volume_trends.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { getLocalShortDate } from '../../transformation.utilities';

describe('Firewall Log Volume Trends Transformation Test Suite:', () => {
  describe('When transforming a kalm response containing firewall log trend data', () => {
    it('should generate and return a correctly constructed Highcharts series object', () => {
      const response = {
        rows: [
          ["2020-03-02", 100, 200, 300],
          ["2020-03-03", 200, 100, 500]
        ]
      };
      expect(firewallLogVolumeTrends(response)).toEqual({
        title:  '',
        description: 'Firewall Log Volume Trends',
        dateOptions: [getLocalShortDate(new Date('2020-03-02T00:00:00.000Z')), getLocalShortDate(new Date('2020-03-03T00:00:00.000Z'))],
        series: [{
          name: 'Firewall Log Messages',
          data: [100, 200],
          className: 'al-gray-500',
          showInLegend: false,
          type: 'line'
        }, {
          name: 'Firewall Log Observations',
          data: [200, 100],
          className: 'al-blue-500',
          showInLegend: false,
          type: 'area'
        }, {
          name: 'Firewall Log Incidents',
          data: [300, 500],
          className: 'al-purple-500',
          showInLegend: false,
          type: 'area'
        }]
      });
    });
  });
  describe('When transforming a kalm response containing zero rows', () => {
    it('should generate aand return a ZeroState response object', () => {
      const response = {
        rows: []
      };
      expect(firewallLogVolumeTrends(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
});
