import { ZeroStateReason } from '@al/ng-visualizations-components';
import { baseSemiCircleObject } from '../base_objects.transformation';

enum Column {
  Date,
  SuccessfulLoginsCount,
  FailedLoginsCount
}

/**
 * totalLogins transformation
 * kalm: dashboards_sso_user_login_trends
 * we used trends to calculate the total of 'successful' and 'failed' logins
 * @param response - Raw data from API
 */
export const totalLogins = (response: { rows: (string|number)[][], column_info: { type: string, name: string }[] }) => {
  const config = Object.assign({}, baseSemiCircleObject);
  const reducer = (accumulator: number, currentValue: number): number => accumulator + currentValue;
  const successful: number = response.rows.map(item => item[Column.SuccessfulLoginsCount] as number).reduce(reducer,0);
  const failed: number = response.rows.map(item => item[Column.FailedLoginsCount] as number).reduce(reducer,0);

  if (successful + failed === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  Object.assign(config.series[0], {
    data: [{
      name: 'Successful',
      y: successful,
      className: 'al-yellow-500',
    }, {
      name: 'Failed',
      y: failed,
      className: 'al-red-500',
    }]
  });

  return JSON.parse(JSON.stringify(config));
};
