import { Widget as WidgetConfig, ZeroStateReason, WidgetContentType } from '@al/ng-visualizations-components';

export const configurationExposuresCountSeverity = (response: any, contentType?: WidgetContentType) => {
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
  // Remove the 'ALL' object - not needed for display
  delete data.all;
  const keys = Object.keys(data);
  // Build the config and filter out all 0 (zero) values
  const config = keys.map(item => {
    return {
      name: item.charAt(0).toUpperCase() + item.slice(1),
      value: data[item],
      className: item === 'high' ? 'critical' : item,
      recordLink: {
        category: 'configuration',
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
