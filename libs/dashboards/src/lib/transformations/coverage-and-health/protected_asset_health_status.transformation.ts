import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import { HealthSummaryResponse } from '@al/assets-query';
import { baseSemiCircleObject } from '../base_objects.transformation';

export const protectedAssetHealthStatus = (response: HealthSummaryResponse, item?: WidgetConfig) => {
  const config = Object.assign({}, baseSemiCircleObject);
  const healthy = response.networks.health.scores[0].count;
  const unhealthy = response.networks.health.scores[1].count;
  if (healthy + unhealthy === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  Object.assign(config.series[0], {
    data: [{
      name: 'Healthy',
      y: healthy,
      className: 'healthy',
      recordLink: {
        health_level: 'healthy'
      }
    }, {
      name: 'Unhealthy',
      y: unhealthy,
      className: 'unhealthy',
      recordLink: {
        health_level: 'unhealthy'
      }
    }]
  });
  return JSON.parse(JSON.stringify(config));
};
