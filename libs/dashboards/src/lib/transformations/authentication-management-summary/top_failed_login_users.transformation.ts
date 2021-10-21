import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Response {
  TopLogins,
  TotalLoginsCount
}

enum Column {
  UserName,
  LoginsCount
}

enum LoginType {
    Successful,
    Failed
}

/**
 * topFailedLoginUsers transformation
 * kalm: dashboards_sso_top_failed_login_users, dashboards_sso_total_logins
 * @param response - Raw data from API
 */
export const topFailedLoginUsers = (response: { rows:any, column_info:{type:string, name:string}[] }[]): TableListConfig | ZeroState => {
  const logins = response[Response.TopLogins];
  const totalLogins = response[Response.TotalLoginsCount] ? response[Response.TotalLoginsCount].rows[0] : undefined;
  const totalFailedLogins = totalLogins ? totalLogins[LoginType.Failed] : undefined;
  if (logins.rows.length === 0 || !totalLogins) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }
  // sort by LoginsCount - desc
  const assets = logins.rows.sort((a, b) => b[Column.LoginsCount] - a[Column.LoginsCount]);
  return {
    headers: [
      { name: 'User Name', field: 'user_name', class: 'left' },
      { name: 'Failed Logins', field: 'logins', class: 'right' },
      { name: '% of Total', field: 'percentage', class: 'right' }
    ],
    body: assets.map((asset) => ({
      user_name: asset[Column.UserName],
      logins: asset[Column.LoginsCount].toFixed(0),
      percentage: `${((asset[Column.LoginsCount] * 100) / totalFailedLogins).toFixed(2)}%`
    }))
  };
};
