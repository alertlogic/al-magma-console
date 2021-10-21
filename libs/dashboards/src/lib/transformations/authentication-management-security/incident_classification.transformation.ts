import { ZeroStateReason } from '@al/ng-visualizations-components';
import { isAuthenticationIncident } from '../../dashboards.types';

/**
 * Returns the color for the bar based on the incidents attack classification
 * @param attackClassification - incident attack classification
 */
const getColors = (attackClassification: string): string => {
  switch (attackClassification) {
    case 'admin:activity':
      return 'al-blue-500';
    case 'authentication:activity':
      return 'al-purple-500';
    default:
      return 'al-blue-500';
  }
};

/**
 * incidentClassifications transformation
 * total incident by 'incident.attackClassId_str'
 * just 'admin:activity' and 'authentication:activity' are valid
 * @param response - Raw data from API
 */
export const incidentClassifications = (response: any): any => {
  const data = JSON.parse(JSON.stringify(response.aggregations.createtime_str.date_period));
  const count = data ? data.count : 0;
  const incidentTypesClasses = data['incident.attackClassId_str'];
  const keys = incidentTypesClasses && Object.keys(incidentTypesClasses).filter(item => isAuthenticationIncident(item));
  let labels: string[] = [];
  if (count === 0 || keys.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  } else {
    // Build the config and filter out all 0 (zero) values
    const seriesData = keys.map((item) => {
      return {
        name: item,
        value: incidentTypesClasses[item],
        className: getColors(item),
        recordLink: {
          category: item,
          startDate: '<start_date_time>',
          endDate: '<end_date_time>'
        },
        y: incidentTypesClasses[item],
        percent: `${Math.round((incidentTypesClasses[item] / count) * 100)}%`
      };
    });
    seriesData.sort((a, b) => b.value - a.value);
    labels = seriesData.map((series) => {
      return series.name;
    });
    return {
      dateOptions: labels,
      series: [{
        data: seriesData,
        showInLegend: false
      }]
    };
  }
};
