import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import * as Transformation from '../attack_classification_type_wla.transformation';

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

      const config = Transformation.attackClassificationTypeWla(response);
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
              count: 2,
              'incident.attackClassId_str': {
                "attack": 1,
                "sql": 1,
              }
            }
          }
        },
        total: 5
      };
      baseConfig = [
        { name: 'attack', value: 1, y: 1, percent: '50%', className: 'al-blue-200', recordLink: {category: 'attack', source: 'WLA', startDate: '<start_date_time>', endDate: '<end_date_time>'} },
        { name: 'sql', value: 1, y: 1, percent: '50%', className: 'al-blue-300', recordLink: {category: 'sql', source: 'WLA', startDate: '<start_date_time>', endDate: '<end_date_time>'} },
      ];
    });


    it('should pass back the expected config', () => {
      const config = Transformation.attackClassificationTypeWla(baseResponse);
      expect(config).toEqual({
        series: [{
          data: baseConfig
        }]
      });
    });
  });
});
