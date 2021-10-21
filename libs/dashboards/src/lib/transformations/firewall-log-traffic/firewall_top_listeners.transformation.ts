import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Response {
  Connections,
  TotalConnections
}

enum Column {
  Ip,
  ConnectionsCount,
  ConnectionsCountTotal
}

/**
 * topListeners transformation
 * kalm: dashboards_fw_top_listeners_by_connections, dashboards_fw_total_connections
 * BI added dashboards_fw_total_connections because of the limitations with the kalms querys
 * @param response - Raw data from API
 */
export const topListeners = (response: {rows:any[], column_info:any[]}[]): TableListConfig | ZeroState => {
  const connections = response[Response.Connections];
  const totalConnections:number = response[Response.TotalConnections]['rows'][0] &&
                                  response[Response.TotalConnections]['rows'][0].length > 0 ? response[Response.TotalConnections]['rows'][0][0] : null;
  if (connections.rows.length === 0 || !totalConnections) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }
  // sort by ConnectionsCount - desc
  const assets = connections.rows.sort((a,b) => b[Column.ConnectionsCount] - a[Column.ConnectionsCount]);
  return {
    headers: [
      { name: 'Internal IP', field: 'ip', class: 'left' },
      { name: 'Connections', field: 'connections_count', class: 'right' },
      { name: '% of Total', field: 'percentage_connections_count', class: 'right' }
    ],
    body: assets.map((asset) => ({
      ip: asset[Column.Ip],
      connections_count: asset[Column.ConnectionsCount].toFixed(0),
      percentage_connections_count: `${((asset[Column.ConnectionsCount].toFixed(2) * 100) / totalConnections).toFixed(2)}%`
    }))
  };
};
