import { ZeroStateReason } from '@al/ng-visualizations-components';
import { SeverityCountSummaries } from '../kalm.named_query_response.types';
import { kalmDateStringToJSDate, getLocalShortDate } from '../transformation.utilities';

enum Column {
  Date,
  ConnectionCountSummary
}

/**
 * 10 colors because we expected max 10 protocols from BI
 */
const colors = ['al-smokeBlue-500', 'al-orange-500', 'al-gray-500', 'al-amber-500', 'al-blue-500', 'al-red-500', 'al-green-500', 'al-yellow-500', 'al-purple-500', 'al-essentials-500'];

/**
 * Generate series for the graph data key
 * @param type - Serie type e.g protocol TCP, UDP
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
        protocol: type,
        startDate: startDT,
        endDate: endDT
      }
    };
  });
};


/**
 * connectionTrendsTopProtocols transformation
 * Setup dashboard widget data
 * kalm: dashboards_fw_top_protocols_trends
 * @param response - Raw data from API
 */
export const connectionTrendsTopProtocols = (response: SeverityCountSummaries) => {
  const rows = response.rows;
  const protocols = rows && rows[0] && rows[0][1] ? Object.keys(rows[0][1]) : undefined;
  if (rows.length === 0 || !protocols) {
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
  protocols.map((protocol, index) => {
    const data = generateSeries(protocol, response);
    const total = data.reduce((acc, b) => acc + b.y, 0);
    if(total > 0) {
      dataSeries.push({
        name: protocol,
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
