import { protectedAssetHealthStatus } from '../protected_asset_health_status.transformation';
import { HealthSummaryResponse } from '@al/assets-query';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Transformation Test Suite: Protected Asset Health Status', () => {
  describe('Given a Health Summary response object', () => {
    it('should extract the network health scores for use in a correctly formatted chart config', () => {
      const response: HealthSummaryResponse = {
        networks: {
          health: {
            scores: [
              {
                count: 25
              },
              {
                count: 35
              }
            ]
          }
        }
      };
      expect(protectedAssetHealthStatus(response)).toEqual({
        title: '',
        series: [{
          type: 'pie',
          name: '',
          innerSize: '50%',
          data: [{
            name: 'Healthy',
            y: 25,
            className: 'healthy',
            recordLink: {
              health_level: 'healthy'
            }
          }, {
            name: 'Unhealthy',
            y: 35,
            className: 'unhealthy',
            recordLink: {
              health_level: 'unhealthy'
            }
          }]
        }],
        dataLabels: {
          style: {
            textOutline: '0px',
            color: 'white'
          }
        }
      });
    });
  });
  describe('Given that the response object count equals 0', () => {
    it('Should return a zero state object', () => {
      const response: HealthSummaryResponse = {
        networks: {
          health: {
            scores: [
              {
                count: 0
              },
              {
                count: 0
              }
            ]
          }
        }
      };
      expect(protectedAssetHealthStatus(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
});
