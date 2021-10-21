import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import * as Transformation from '../incident_types.transformation';

describe('Incident Types transformation', () => {
  /*
   *
   */
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

      const config = Transformation.incidentTypes(response);
      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  /*
   *
   */
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
                "attack": 1,
                "sql": 9,
              }
            }
          }
        },
        total: 5
      };
      baseConfig = [
        { name: 'sql', value: 9, y: 9, percent: '90%', className: 'al-blue-500', recordLink: {category: 'sql', startDate: '<start_date_time>', endDate: '<end_date_time>'} },
        { name: 'attack', value: 1, y: 1, percent: '10%', className: 'al-blue-500', recordLink: {category: 'attack', startDate: '<start_date_time>', endDate: '<end_date_time>'} }
      ];
    });


    it('should pass back the expected config', () => {
      const config = Transformation.incidentTypes(baseResponse);
      expect(config).toEqual({
        dateOptions: ['sql', 'attack'],
        series: [{
          data: baseConfig,
          showInLegend: false
        }]
      });
    });
  });
});
