import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import * as Transformation from '../incident_count_severity.transformation';

describe('Incidents count by severity transformation', () => {
  /*
   *
   */
  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response = {
        aggregations: {
          createtime_str: {
            date_period: {
              'incident.threatRating': {}
            }
          }
        },
        total: 0
      };

      const config = Transformation.incidentCountSeverity(response);
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
              count: 5,
              'incident.threatRating': {
                "Critical": 1,
                "High": 1,
                "Medium": 1,
                "Low": 1,
                "None": 1,
              }
            }
          }
        },
        total: 5
      };
      baseConfig = [
        { name: 'Critical', value: 1, y: 1, percent: '20%', className: 'critical', recordLink: {threat: 'Critical', startDate: '<start_date_time>', endDate: '<end_date_time>'} },
        { name: 'High', value: 1, y: 1, percent: '20%', className: 'medium', recordLink: {threat: 'High', startDate: '<start_date_time>', endDate: '<end_date_time>'} },
        { name: 'Medium', value: 1, y: 1, percent: '20%', className: 'low', recordLink: {threat: 'Medium', startDate: '<start_date_time>', endDate: '<end_date_time>'} },
        { name: 'Low', value: 1, y: 1, percent: '20%', className: 'info', recordLink: {threat: 'Low', startDate: '<start_date_time>', endDate: '<end_date_time>'} },
        { name: 'Info', value: 1, y: 1, percent: '20%', className: 'info2', recordLink: {threat: 'Info', startDate: '<start_date_time>', endDate: '<end_date_time>'} },
      ];
    });

    it('should convert None into Info', () => {
      const config = Transformation.incidentCountSeverity(baseResponse);
      expect(config.series[0].data.findIndex((item) => item.name === 'Info')).toBeGreaterThanOrEqual(0);
    });

    it('should not contain Info if None was not passed in', () => {
      baseResponse = {
        aggregations: {
          createtime_str: {
            date_period: {
              'incident.threatRating': {
                "Critical": 1,
                "High": 1,
                "Medium": 1,
                "Low": 1,
              }
            }
          }
        },
        total: 4
      };
      const config = Transformation.incidentCountSeverity(baseResponse);
      expect(config.series[0].data.findIndex((item) => item.name === 'Info')).toBeLessThan(0);
    });

    it('should pass back the expected config', () => {
      const config = Transformation.incidentCountSeverity(baseResponse);
      expect(config).toEqual({
        series: [{
          data: baseConfig
        }]
      });
    });
  });
});
