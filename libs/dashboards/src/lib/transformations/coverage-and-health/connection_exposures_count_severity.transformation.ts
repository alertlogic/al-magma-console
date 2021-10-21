import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';

/**
 * Get all the exposures with category = connection
 * @param response - Raw data from api
 */
export const connectionExposuresCountSeverity = (response: any) => {
  // Copy the data we need
  const data = Object.assign({}, response.summary.severities);
  const total = data.all;
  const order = ['High', 'Medium', 'Low', 'Info'];

  if (data.all === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }
  delete data.all;
  const keys = Object.keys(data);
  const config = keys.map(item => {
    return {
      name: item.charAt(0).toUpperCase() + item.slice(1),
      value: data[item],
      className: item === 'high' ? 'critical' : item,
      recordLink: {
        category: 'connection',
        severity: item
      },
      y: data[item],
      percent: `${Math.round((data[item] / total)  * 100)}%`
    };
  }).filter(item => item.y > 0);

  const seriesData = order.map(item => {
    return config.find(confItem => confItem.name === item || undefined);
  }).filter(item  => item !==  undefined);

  return {
    series: [{
      data: seriesData
    }]
  };
};
