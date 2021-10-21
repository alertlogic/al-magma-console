import { ZeroStateReason } from '@al/ng-visualizations-components';
import { SeverityCountSummaries } from '../kalm.named_query_response.types';
import { kalmDateStringToJSDate, getLocalShortDate } from '../transformation.utilities';

enum Column {
  Date,
  ConnectionCountSummary
}

/**
 * 10 colors because we expected max of 10 attack-classes from BI
 */
const colors = ['al-essentials-500', 'al-purple-500', 'al-amber-500', 'al-blue-500', 'al-gray-500', 'al-smokeBlue-500', 'al-orange-500', 'al-red-500', 'al-green-500', 'al-yellow-500'];

/**
 * Generate series for the graph data key
 * @param type - Serie type e.g application-atack, suspicious activity
 * @param data - Dashboard data (column info and rows)
 */
const generateSeries = (type: string, data: SeverityCountSummaries): any[] => {

  const rows = data.rows;
  return rows.map((item, idx) => {
    const startDT: number = kalmDateStringToJSDate(item[Column.Date] as string).getTime() / 1000;
    const endDT: number = kalmDateStringToJSDate(item[Column.Date] as string, 23, 59, 59, 999).getTime() / 1000;

   return {
      x: idx,
      y: item[1][type] as number ||  null,
      recordLink: {
        category: type,
        startDate: startDT,
        endDate: endDT
      }
    };
  });
};

/**
 * webAttackTrendsByAttackClass transformation
 * endpoint: dashboards_wla_trends_by_attack_class
 * Dashboard widget data set up
 * @param response - Raw data from API
 */
export const webAttackTrendsByAttackClass = (response: SeverityCountSummaries) => {
  const rows = response.rows;
  const attackClasses: string[] = [];
  const dates: string[] = [];

  response.rows.forEach((row) => {
    const parsedDate: Date  = kalmDateStringToJSDate(row[Column.Date] as string);
    dates.push(getLocalShortDate(parsedDate));
    const attackSummary: string[] = Object.keys(row[Column.ConnectionCountSummary]);
    attackSummary.forEach((item) => {
      if (attackClasses.indexOf(item) === -1) {
        attackClasses.push(item);
      }
    });
  });

  if (rows.length === 0 || !attackClasses) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const dataSeries = [];
  attackClasses.map((application, index) => {
    const data = generateSeries(application, response);
    const total: number = data.reduce((acc, b) => acc + b.y, 0);
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
        text: 'Attack Class'
      }
    },
    series: dataSeries,
    legend: {
      reversed: true
    }
  };
};
