import { ZeroStateReason } from '@al/ng-visualizations-components';
import { incidentClassifications } from '../incident_classification.transformation';

describe('Authentication management security - Incident Types transformation', () => {
  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response = {
        aggregations: {
          createtime_str: {
            date_period: {
              count: 0
            }
          }
        }
      };

      const config = incidentClassifications(response);
      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are results', () => {
    let baseResponse: any = {};
    let baseConfig: any = {};

    beforeEach(() => {
      baseResponse = {
        aggregations: {
          createtime_str: {
            date_period: {
              count: 10,
              'incident.attackClassId_str': {
                "authentication:activity": 1,
                "admin:activity": 9,
              }
            }
          }
        },
        total: 5
      };
      baseConfig = [
        { name: 'admin:activity', value: 9, y: 9, percent: '90%', className: 'al-blue-500', recordLink: { category: 'admin:activity', startDate: '<start_date_time>', endDate: '<end_date_time>' } },
        { name: 'authentication:activity', value: 1, y: 1, percent: '10%', className: 'al-purple-500', recordLink: { category: 'authentication:activity', startDate: '<start_date_time>', endDate: '<end_date_time>' } }
      ];
    });

    it('should pass back the expected config', () => {
      const config = incidentClassifications(baseResponse);
      expect(config).toEqual({
        dateOptions: ['admin:activity', 'authentication:activity'],
        series: [{
          data: baseConfig,
          showInLegend: false
        }]
      });
    });
  });
});
