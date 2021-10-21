import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderPlaybook } from '@al/responder';
import { baseSemiCircleObject } from '../base_objects.transformation';

export const playbookStatus = (response: AlResponderPlaybook[], item?: WidgetConfig) => {
  if (response.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  const config = Object.assign({}, baseSemiCircleObject);
  const enabled = response.filter(item => item.enabled).length;
  const disabled = response.filter(item => !item.enabled).length;

  Object.assign(config.series[0], {
    data: [{
      name: 'Active',
      y: enabled,
      className: 'healthy',
      recordLink: {
        enabled: true
      }
    }, {
      name: 'Inactive',
      y: disabled,
      className: 'unhealthy',
      recordLink: {
        enabled: false
      }
    }]
  });
  return JSON.parse(JSON.stringify(config));
};
