import { Widget as WidgetConfig, TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  Deployment,
  Host,
  AvgTriScore,
  VulnCount
}

export const triMostVulnerableHosts = (response: { rows: any[]; }, item?: WidgetConfig): TableListConfig | ZeroState => {
  if (response.rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const assets = response.rows.sort((a,b) => b[Column.AvgTriScore] - a[Column.AvgTriScore] || b[Column.VulnCount] - a[Column.VulnCount]);
  return {
    headers: [
      { name: 'Host Name', field: 'host', class: 'left' },
      { name: 'Deployment', field: 'deployment', class: 'left' },
      { name: 'TRI Score', field: 'tri', class: 'right' },
      { name: 'Distinct Vulns', field: 'vulns', class: 'right' }
    ],
    body: assets.map(asset => ({
      host: asset[Column.Host],
      deployment: asset[Column.Deployment],
      tri: asset[Column.AvgTriScore].toFixed(2),
      vulns: asset[Column.VulnCount]
    })),
  };
};
