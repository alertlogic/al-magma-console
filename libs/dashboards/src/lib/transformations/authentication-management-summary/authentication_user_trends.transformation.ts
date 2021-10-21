import { ZeroStateReason } from '@al/ng-visualizations-components';
import { kalmDateStringToJSDate, getLocalShortDate } from '../transformation.utilities';

const column = {
  Date: 0,
  Successful: 1,
  Failed: 2
};

const logins: string[] = ['Successful', 'Failed'];

const generateSeries = (type: string, data: { rows: (string|number)[][], column_info: { type: string, name: string }[] }): {x: number,y: number}[] => {
  const rows = data.rows;
  return rows.map((item, idx) => {
    return {
      x: idx,
      y: item[column[type]] as number || null
    };
  });
};

/**
 * authenticationUserTrends transformation
 * kalm: dashboards_sso_user_login_trends
 * @param response - Raw data from API
 */
export const authenticationUserTrends = (response: { rows: (string|number)[][], column_info: { type: string, name: string }[] }) => {
  const rows = response.rows;
  const classes = {
    Successful: 'al-yellow-500',
    Failed: 'al-red-500'
  };
  if (rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const dates: string[] = [];
  response.rows.forEach((row) => {
    const parsedDate: Date = kalmDateStringToJSDate(row[column.Date] as string);
    dates.push(getLocalShortDate(parsedDate));
  });

  const dataSeries = [];
  logins.map((login) => {
    const data = generateSeries(login, response);
    const total = data.reduce((acc, b) => acc + b.y, 0);
    if (total > 0) { // Prevent zero data series to appear on chart\in legend
      dataSeries.push({
        name: login,
        data: data,
        className: classes[login],
        type: 'area'
      });
    }
  });

  return {
    xAxis: {
      categories: dates
    },
    yAxis: {
      title: {
        text: 'Count of Logins'
      }
    },
    series: dataSeries,
    legend: {
      reversed: true
    }
  };
};
