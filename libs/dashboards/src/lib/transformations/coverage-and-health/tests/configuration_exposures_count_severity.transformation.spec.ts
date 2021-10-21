import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import * as Transformation from '../configuration_exposures_count_severity.transformation';

describe('Configuration exposures count severity transformation', () => {
  /*
   *
   */
  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response: any = {
        exposures: [],
        summary: {
          severities: {
            all: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0
          }
        }
      };

      const config = Transformation.configurationExposuresCountSeverity(response);
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
        exposures: [],
        summary: {
          severities: {
            all: 4,
            high: 1,
            medium: 1,
            low: 1,
            info: 1
          }
        }
      };

      baseConfig = [
        { name: 'High', value: 1, y: 1, className: 'critical', percent: '25%', recordLink: {category: 'configuration', severity: 'high'}},
        { name: 'Medium', value: 1, y:1, className: 'medium', percent: '25%', recordLink: {category: 'configuration', severity: 'medium'} },
        { name: 'Low', value: 1, y:1, className: 'low', percent: '25%',recordLink: {category: 'configuration', severity: 'low'} },
        { name: 'Info', value: 1, y:1, className: 'info', percent: '25%', recordLink: {category: 'configuration', severity: 'info'} },
      ];
    });

    it('should pass back the expected config 1', () => {
      const config = Transformation.configurationExposuresCountSeverity(baseResponse);
      expect(config).toEqual({
        series: [{
          data: baseConfig
        }]
      });
    });
  });
});

