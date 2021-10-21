import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  UserName,
  IpCountry,
  IpAddress,
  LoginTotal
}

/**
 * signInAttemptsFromRiskyIp transformation
 * kalm: dashboards_auth_top_login_attempts_risky_ip
 * @param response - Raw data from API
 */
export const signInAttemptsFromRiskyIp = (response: { rows: any[][], column_info: { type: string, name: string }[] }): TableListConfig | ZeroState => {

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
      { name: 'IP Address', field: 'ip_address', class: 'left' },
      { name: 'IP Country', field: 'ip_country', class: 'left' },
      { name: 'Login Total', field: 'login_total', class: 'right' },
    ],
    body: assets.map((asset) => ({
      user_name: asset[Column.UserName],
      ip_address: asset[Column.IpAddress],
      ip_country: asset[Column.IpCountry],
      login_total: asset[Column.LoginTotal],
    }))
  };
};
