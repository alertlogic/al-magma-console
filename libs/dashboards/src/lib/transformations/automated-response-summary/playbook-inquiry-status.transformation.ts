import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderInquiries } from '@al/responder';
import { baseSemiCircleObject } from '../base_objects.transformation';
import { capitalizeFirstLetter } from '../transformation.utilities';

export const playbookInquiryStatus = (response: AlResponderInquiries, item?: WidgetConfig) => {
  const config = Object.assign({}, baseSemiCircleObject);
  const statuses = response.summary.statuses;
  const collect = {
    'pending': 'al-orange-500',
    'failed': 'al-red-500',
    'succeeded': 'al-green-500'};
  const data = [];
  statuses.forEach(status => {
    const name = Object.keys(status)[0];
    if (collect.hasOwnProperty(name)) {
      const value = status[name];
      data.push({
        name: capitalizeFirstLetter(name),
        y: value,
        className: collect[name],
        recordLink: {
          statuses: name,
          startDate: '<start_date_time>',
          endDate: '<end_date_time>'
        }
      });
    }
  });

  if (data.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  Object.assign(config.series[0], {
    data: data
  });
  return JSON.parse(JSON.stringify(config));
};
