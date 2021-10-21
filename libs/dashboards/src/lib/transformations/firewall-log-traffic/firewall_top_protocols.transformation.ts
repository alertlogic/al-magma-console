import { ZeroStateReason } from '@al/ng-visualizations-components';

/**
 * firewallTopProtocols transformation
 * kalm: dashboards_fw_top_protocols_by_connections
 * @param response - Raw data from API
 */
export const firewallTopProtocols = (response: {rows: any[];}) => {
  enum Column {
    Protocol,
    ConnectionCount
  }
  const protocolNames: string[] = [];
  const seriesData = [];
  let totalCount = 0 ;
  response.rows.forEach((row) => {
    protocolNames.push(row[Column.Protocol]);
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
    dateOptions: protocolNames,
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
