import { Widget as WidgetConfig, TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  DeploymentName,
  HostName,
  HostIncidentCount,
  WorstStatus,
  TotalIncidentCount
}

export const mostAttackedHosts = (response: { rows: any[]; }, item?: WidgetConfig): TableListConfig | ZeroState => {
  const assets = response.rows;
  if (assets.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  return {
    headers: [
      { name: 'Host Name', field: 'host', class: 'left' },
      { name: 'Count', field: 'count', class: 'right' },
      { name: 'Deployment', field: 'deployment', class: 'left' },
      { name: 'Worst Threat Level', field: 'status', class: 'left status' },
      { name: '% of Total Attacks', field: 'percent', class: 'right' }
    ],
    body: assets.map(asset => ({
      host: asset[Column.HostName],
      count: asset[Column.HostIncidentCount],
      deployment: asset[Column.DeploymentName],
      status: asset[Column.WorstStatus].toLowerCase(),
      percent: `${Math.round((asset[Column.HostIncidentCount] / asset[Column.TotalIncidentCount]) * 100)}%`,
      recordLink: {
        advancedSearchQuery: `HostName = "${asset[Column.HostName]}"`,
        startDate: '<start_date_time>',
        endDate: '<end_date_time>'
      }
    })),
  };
};
