import { firewallTrafficLogVolumeTrends } from '../firewall_log_volume_trends.transformation';
import { getLocalShortDate } from '../../transformation.utilities';

describe('Firewall Log Volume Trends transformation Test Suite:', () => {
  describe('When the transformation is called', () => {
    it('should generate a correctly constructed Highchart series configuration object', () => {
      const startDTA = new Date(Date.UTC(2020, 1, 1, 0, 0, 0, 0)).getTime() / 1000;
      const endDTA = new Date(Date.UTC(2020, 1, 1, 23, 59, 59, 999)).getTime() / 1000;
      const startDTB = new Date(Date.UTC(2020, 1, 2, 0, 0, 0, 0)).getTime() / 1000;
      const endDTB = new Date(Date.UTC(2020, 1, 2, 23, 59, 59, 999)).getTime() / 1000;
      const response = {
        rows: [
          ['2020-02-01', 50],
          ['2020-02-02', 150]
        ]
      };
      expect(firewallTrafficLogVolumeTrends(response)).toEqual({
        description: 'Connections',
        dateOptions: [getLocalShortDate(new Date('2020-02-01T00:00:00.000Z')), getLocalShortDate(new Date('2020-02-02T00:00:00.000Z'))],
        yAxisType: 'linear',
        series: [{
          showInLegend: false,
          data: [{
            recordLink: {
              startDate: startDTA,
              endDate: endDTA
            },
            y: 50
          },{
            recordLink: {
              startDate: startDTB,
              endDate: endDTB
            },
            y: 150
          }]
        }]
      });
    });
  });
});
