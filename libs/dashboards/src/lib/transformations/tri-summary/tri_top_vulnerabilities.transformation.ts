import { Widget as WidgetConfig, TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  VulnName,
  AvgTriScore,
  AssetCount
}

export const triTopVulnerabilities = (response: { rows: any[]; }, item?: WidgetConfig): TableListConfig | ZeroState => {
  if (response.rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const assets = response.rows.sort((a,b) => b[Column.AvgTriScore] - a[Column.AvgTriScore] || b[Column.AssetCount] - a[Column.AssetCount]);
  return {
    headers: [
      { name: 'Vulnerability Name', field: 'name', class: 'left' },
      { name: 'TRI Score', field: 'tri', class: 'right' },
      { name: 'Impacted Assets', field: 'assets', class: 'right' }
    ],
    body: assets.map(asset => ({
      name: asset[Column.VulnName],
      tri: asset[Column.AvgTriScore].toFixed(2),
      assets: asset[Column.AssetCount]
    }))
  };
};
