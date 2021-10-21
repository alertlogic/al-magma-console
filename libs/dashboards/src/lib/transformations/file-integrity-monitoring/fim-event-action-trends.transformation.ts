import { ZeroStateReason } from '@al/ng-visualizations-components';
import { kalmDateStringToJSDate, getLocalShortDate } from '../transformation.utilities';

enum Column {
  Date,
  Create_Count,
  Modify_Count,
  Delete_Count
}

/**
 * eventActionTrends transformation
 * kalm: dashboards_fim_event_action_trends
 * @param response - Raw data from API
 */
export const eventActionTrends = (response: { rows: any[], column_info: { type: string, name: string }[] }) => {

  if (response.rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  const dates: string[] = [];
  const series = [{
    name: 'Create',
    data: [],
    className: 'al-green-500',
    showInLegend: false,
    type: 'area'
  }, {
    name: 'Modify',
    data: [],
    className: 'al-orange-500',
    showInLegend: false,
    type: 'area'
  }, {
    name: 'Delete',
    data: [],
    className: 'active-mac',
    showInLegend: false,
    type: 'area'
  }];

  response.rows.forEach((row) => {
    const parsedDate: Date = kalmDateStringToJSDate(row[Column.Date] as string);
    dates.push(getLocalShortDate(parsedDate));
    series[0].data.push(row[Column.Create_Count]);
    series[1].data.push(row[Column.Modify_Count]);
    series[2].data.push(row[Column.Delete_Count]);
  });

  return {
    title: '',
    description: 'FIM Event Action Trends',
    dateOptions: dates,
    series: series
  };
};
