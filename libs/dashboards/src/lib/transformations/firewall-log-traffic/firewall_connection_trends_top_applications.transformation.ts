import { ZeroStateReason } from '@al/ng-visualizations-components';
import { SeverityCountSummaries } from '../kalm.named_query_response.types';
import { kalmDateStringToJSDate, getLocalShortDate } from '../transformation.utilities';

enum Column {
  Date,
  ConnectionCountSummary
}

/**
 * 10 colors because we expected max 10 applications from BI
 */
const colors = ['al-amber-500', 'al-blue-500', 'al-gray-500', 'al-smokeBlue-500', 'al-orange-500', 'al-red-500', 'al-green-500', 'al-yellow-500', 'al-purple-500', 'al-essentials-500'];

/**
 * Generate series for the graph data key
 * @param type - Serie type e.g application HTTPS, DNS
 * @param data - Dashboard data (column info and rows)
 */
const generateSeries = (type: string, data: SeverityCountSummaries): any[] => {

  const rows = data.rows;
  return rows.map((item, idx) => {
    const startDT = kalmDateStringToJSDate(item[Column.Date] as string).getTime() / 1000;
    const endDT = kalmDateStringToJSDate(item[Column.Date] as string, 23, 59, 59, 999).getTime() / 1000;

   return {
      x: idx,
      y: item[1][type] as number ||  null,
      recordLink: {
        application: type,
        startDate: startDT,
        endDate: endDT
      }
    };
  });
};

/**
 * connectionTrendsTopApplications transformation
 * Setup dashboard widget data
 * kalm: dashboards_fw_top_applications_trends
 * @param response - Raw data from API
 */
export const connectionTrendsTopApplications = (response: SeverityCountSummaries) => {
  const rows = response.rows;
  const applications = rows[0] && rows[0][1] ? Object.keys(rows[0][1]) : undefined;
  if (rows.length === 0 || !applications) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const dates: string[] = [];
  response.rows.forEach((row) => {
    const parsedDate: Date  = kalmDateStringToJSDate(row[Column.Date] as string);
    dates.push(getLocalShortDate(parsedDate));
  });

  const dataSeries = [];
  applications.map((application, index) => {
    const data = generateSeries(application, response);
    const total = data.reduce((acc, b) => acc + b.y, 0);
    if(total > 0) {
      dataSeries.push({
        name: application,
        data: data,
        className: colors[index % 10],
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
        text: 'Connections'
      }
    },
    series: dataSeries,
    legend: {
      reversed: true
    }
  };
};
