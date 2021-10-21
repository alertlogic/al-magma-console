import { ZeroStateReason } from '@al/ng-visualizations-components';
import { kalmDateStringToJSDate, getLocalShortDate } from '../transformation.utilities';

const column = {
  Date: 0,
  Data: 1
};

const logins: string[] = ['admin:activity', 'authentication:activity'];

const generateSeries = (type: string, data: { rows: (string | {})[][], column_info: { type: string, name: string }[] }): { x: number, y: number }[] => {
  const rows = data.rows;
  return rows.map((item, idx) => {
    const startDT: number = kalmDateStringToJSDate(item[column.Date] as string).getTime() / 1000;
    const endDT: number = kalmDateStringToJSDate(item[column.Date] as string, 23, 59, 59, 999).getTime() / 1000;
    return {
      x: idx,
      y: item[column.Data][type] as number || null,
      recordLink: {
        source: 'LOG',
        advancedSearchQuery: `Classification = "${type}"`,
        startDate: startDT,
        endDate: endDT
      }
    };
  });
};

/**
 * incidentClassificationTrends transformation
 * kalm: dashboards_auth_incident_trends
 * @param response - Raw data from API
 */
export const authIncidentClassificationTrends = (response: { rows: (string | {})[][], column_info: { type: string, name: string }[] }) => {
  const rows = response.rows;
  const classes = {
    'admin:activity': 'al-blue-500',
    'authentication:activity': 'al-purple-500'
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
        text: 'Count of Incidents'
      }
    },
    series: dataSeries,
    legend: {
      reversed: true
    }
  };
};
