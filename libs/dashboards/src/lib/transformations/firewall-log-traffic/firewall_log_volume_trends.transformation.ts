import { kalmDateStringToJSDate, getLocalShortDate } from '../transformation.utilities';

interface RecordLink {
  startDate: number;
  endDate: number;
}

/**
 * Returns the local short date given a string date
 * @param date - String date e.g '2020-04-27'
 */
function generateDate(date: string): string {
  const parsedDate: Date  = kalmDateStringToJSDate(date);
  return getLocalShortDate(parsedDate);
}


/**
 * Returns the recordLink object for the graph
 * @param date - String date e.g '2020-04-27'
 */
function generateRecordLink(date: string): RecordLink {
  const startDate = kalmDateStringToJSDate(date).getTime() / 1000;
  const endDate = kalmDateStringToJSDate(date as string, 23, 59, 59, 999).getTime() / 1000;
  return {
    startDate,
    endDate
  };
}

/**
 * Returns an object {dateOptions, series} used as data for the graph
 * @param rows - Rows from raw data
 */
function generateData(rows:any): any {
  const dateOptions: string[] = rows.map((row) => generateDate(row[0]));
  const series: number[] = rows.map((row) => {
    return {
      recordLink: generateRecordLink(row[0]),
      y: row[1]
    };
  });

  return {
    dateOptions,
    series
  };
}

/**
 * firewallTrafficLogVolumeTrends transformation
 * kalm: dashboards_fw_log_volume_trends
 * @param response - Raw data from API
 */
export const firewallTrafficLogVolumeTrends = (response: any) => {
  const rows = [...response.rows];
  const data = generateData(rows);

  return {
    description: 'Connections',
    dateOptions: [...data.dateOptions],
    yAxisType: 'linear',
    series: [{
      showInLegend: false,
      data: [...data.series]
    }]
  };
};
