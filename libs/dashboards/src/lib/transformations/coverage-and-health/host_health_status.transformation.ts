import { ZeroStateReason } from '@al/ng-visualizations-components';
import { baseSemiCircleObject } from '../base_objects.transformation';

/**
 * hostHealthStatus transformation
 * @param response - Raw data from API
 */
export const hostHealthStatus = (response: any) => {
  const config = Object.assign({}, baseSemiCircleObject);
  const hostList: any[] = response.list;
  // health_level == 0 -> healthy, health_level == 2 -> unhealthy
  const healthy: number = hostList.filter(item=> item.health_level === 0).length;
  const unhealthy: number = hostList.filter(item=> item.health_level === 2).length;

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
