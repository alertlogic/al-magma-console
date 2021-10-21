import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  AssetName,
  EventCount,
  Total
}

/**
 * topFileEventSystems transformation
 * kalm: dashboards_fim_event_systems
 * @param response - Raw data from API
 */
export const topFileEventSystems = (response: { rows: any[], column_info: { type: string, name: string }[] }): TableListConfig | ZeroState => {
  const fileEventSystemsData: any[] = response.rows;

  if (fileEventSystemsData.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }
  // sort by EventCount - desc
  const assets = fileEventSystemsData.sort((a, b) => b[Column.EventCount] - a[Column.EventCount]);
  return {
    headers: [
      { name: 'Host Name', field: 'systemName', class: 'left' },
      { name: 'Event Count', field: 'count', class: 'right' },
      { name: '% of Total', field: 'percentage', class: 'right' }
    ],
    body: assets.map((asset) => ({
      systemName: asset[Column.AssetName],
      count: asset[Column.EventCount],
      percentage: asset[Column.Total] !== 0 ? `${((asset[Column.EventCount] * 100) / asset[Column.Total]).toFixed(2)}%` : '0%'
    }))
  };
};
