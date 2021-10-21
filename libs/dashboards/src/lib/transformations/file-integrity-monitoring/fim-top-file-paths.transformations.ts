import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  FilePath,
  DeploymentName,
  EventCount,
  Total
}

/**
 * topFilePaths transformation
 * kalm: dashboards_fim_top_file_paths
 * @param response - Raw data from API
 */
export const topFilePaths = (response: { rows: any[], column_info: { type: string, name: string }[] }): TableListConfig | ZeroState => {
  const filePathsData: any[] = response.rows;

  if (filePathsData.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }
  // sort by EventCount - desc
  const assets = filePathsData.sort((a, b) => b[Column.EventCount] - a[Column.EventCount]);
  return {
    headers: [
      { name: 'File Path', field: 'filePath', class: 'left' },
      { name: 'Deployment Name', field: 'deploymentName', class: 'left' },
      { name: 'FIM Events', field: 'count', class: 'right' },
      { name: '% of Total', field: 'percentage', class: 'right' }
    ],
    body: assets.map((asset) => ({
      filePath: asset[Column.FilePath],
      deploymentName: asset[Column.DeploymentName],
      count: asset[Column.EventCount],
      percentage: asset[Column.Total] !== 0 ? `${((asset[Column.EventCount] * 100) / asset[Column.Total]).toFixed(2)}%` : '0%'
    }))
  };
};
