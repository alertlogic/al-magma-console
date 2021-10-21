import { ZeroStateReason } from '@al/ng-visualizations-components';

/**
 * firewallTopApplications transformation
 * kalm: dashboards_fw_top_applications_by_connections
 * @param response - Raw data from API
 */
export const firewallTopApplications = (response: {rows: any[];}) => {
  enum Column {
    Application,
    ConnectionCount
  }
  const applicationNames: string[] = [];
  const seriesData = [];
  let totalCount = 0 ;
  response.rows.forEach((row) => {
    applicationNames.push(row[Column.Application]);
    seriesData.push({y: row[Column.ConnectionCount], className: 'al-blue-400'});
    totalCount = totalCount + row[Column.ConnectionCount];
  });
  if (totalCount === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }
  return {
    dateOptions: applicationNames,
    description: "Connections",
    inverted: true,
    yAxisType: "linear",
    tooltipString: '{{name}}: {{value:0dp}}',
    series: [{
      type: "column",
      data: seriesData,
      showInLegend: false
    }]
  };
};
