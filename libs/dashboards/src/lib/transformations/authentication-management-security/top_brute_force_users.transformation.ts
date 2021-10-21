import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  UserName,
  Count,
  Total
}

/**
 * topBruteForceUsers transformation
 * kalm: dashboards_auth_top_brute_force
 * @param response - Raw data from API
 */
export const topBruteForceUsers = (response: { rows: any[][], column_info: { type: string, name: string }[] }): TableListConfig | ZeroState => {
  if (response.rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const assets = response.rows;
  return {
    headers: [
      { name: 'User Name', field: 'user_name', class: 'left' },
      { name: 'Count', field: 'count', class: 'right' },
      { name: '% of Total', field: 'percentage', class: 'right' },
    ],
    body: assets.map((asset) => ({
      user_name: asset[Column.UserName],
      count: asset[Column.Count],
      percentage: `${ ((Number(asset[Column.Count]) / Number(asset[Column.Total])) * 100).toFixed(2)}%`,
    })).sort((a,b) => b.count - a.count)
  };
};
