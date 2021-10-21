import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  UserName,
  Date
}

/**
 * mfaDisabledUsers transformation
 * kalm: dashboards_auth_mfa_disabled_users
 * @param response - Raw data from API
 */
export const mfaDisabledUsers = (response: { rows: string[][], column_info: { type: string, name: string }[] }): TableListConfig | ZeroState => {
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
      { name: 'Date disabled', field: 'date', class: 'left' },
    ],
    body: assets.map((asset) => ({
      user_name: asset[Column.UserName],
      date: asset[Column.Date]
    }))
  };
};
