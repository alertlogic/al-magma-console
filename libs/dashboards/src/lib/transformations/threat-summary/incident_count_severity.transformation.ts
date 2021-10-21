import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';

/*
 *
 */
const generateClass = (key: string): string => {
  const convert = {
    Critical: 'critical',
    High: 'medium',
    Medium: 'low',
    Low: 'info',
    Info: 'info2',
  };
  return convert[key];
};


/*
 *
 */
export const incidentCountSeverity = (response: any, item?: WidgetConfig): any => {

  // Copy the data
  const data = JSON.parse(JSON.stringify(response.aggregations.createtime_str.date_period['incident.threatRating']));
  const total = response.aggregations.createtime_str.date_period.count;
  const order = ['Critical', 'High', 'Medium', 'Low', 'Info'];
  if (response.total === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  } else {
    // Rename None to Info
    if (data.hasOwnProperty('None')) {
      data.Info = data.None;
      delete data.None;
    }

    const keys = Object.keys(data);

    // Build the config and filter out all 0 (zero) values
    const config = keys.map(item => {
      return {
        name: item.charAt(0).toUpperCase() + item.slice(1),
        value: data[item],
        className: generateClass(item),
        recordLink: {
          threat: item,
          startDate: '<start_date_time>',
          endDate: '<end_date_time>'
        },
        y: data[item],
        percent: `${Math.round((data[item] / total)  * 100)}%`
      };
    }).filter(item => item.value > 0);

    const seriesData = order.map(item => {
      return config.find(confItem => confItem.name === item || undefined);
    }).filter(item  => item !==  undefined);

    return {
      series: [{
        data: seriesData
      }]
    };
  }
};
