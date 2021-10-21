import { ZeroStateReason } from '@al/ng-visualizations-components';

enum Column {
  Vendor,
  Count
}

const colors: string[] = ['al-amber-500', 'al-red-500', 'al-green-500', 'al-yellow-500', 'al-purple-500', 'al-essentials-500'];

/**
 * Returns the css class for the widget
 * @param key - Auth source
 */
const generateClass = (key: string): string => {
  const convert = {
    "Azure": 'al-blue-500',
    "Salesforce": 'al-orange-500',
    "Okta": 'al-smokeBlue-500',
    "Auth0": 'al-gray-500'
  };
  return convert[key] ? convert[key] : colors[Math.floor(Math.random() * colors.length)];
};

/**
 * authenticationAttempts transformation
 * kalm: dashboards_sso_auth_attempts
 * @param response - Raw data from API
 */
export const authenticationAttempts = (response: {rows:any[], column_info:{type:string, name:string}[]}): any => {
  const data = response.rows;
  if (response.rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  } else {
    // Build the config and filter out all 0 (zero) values
    const config = data.map(item => {
      return {
        name: item[Column.Vendor],
        value: item[Column.Count],
        className: generateClass(item[Column.Vendor]),
        y: item[Column.Count],
      };
    }).filter(item => item.value > 0);
    return {
      series: [{
        data: config
      }]
    };
  }
};
