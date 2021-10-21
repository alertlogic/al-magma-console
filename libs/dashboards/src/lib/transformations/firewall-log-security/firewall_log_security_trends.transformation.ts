import { WidgetContentType } from '@al/ng-visualizations-components';
import { kalmDateStringToJSDate, getLocalShortDate } from '../transformation.utilities';

interface RecordLink {
  startDate: number;
  endDate: number;
}

/*
 *
 */
function generateDate(date: string): string {
  const parsedDate: Date  = kalmDateStringToJSDate(date);
  return getLocalShortDate(parsedDate);
}


/*
 *
 */
function generateRecordLink(date: string): RecordLink {
  const startDate = kalmDateStringToJSDate(date).getTime() / 1000;
  const endDate = kalmDateStringToJSDate(date as string, 23, 59, 59, 999).getTime() / 1000;
  return {
    startDate,
    endDate
  };
}

/*
 *
 */
function generateData(rows): any {
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

/*
 *
 */
export const firewallSecurityIncidentTrends = (response: any, contentType?: WidgetContentType) => {
  const rows = [...response.rows];
  const data = generateData(rows);

  return {
    title: '',
    description: 'Count of Incidents',
    dateOptions: [...data.dateOptions],
    yAxisType: 'linear',
    series: [{
      name: 'Incidents',
      showInLegend: false,
      data: [...data.series]
    }]
  };
};
