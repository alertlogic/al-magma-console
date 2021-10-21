import { ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';
import { BaseColumnConfig } from '../base_objects.transformation';
import { kalmDateStringToJSDate, getLocalShortDate } from '../transformation.utilities';

enum Column {
  Date,
  Messages_Count,
  Observations_Count,
  Incidents_Count
}

export const firewallLogVolumeTrends = (response: {rows: any[];}) => {

  if (response.rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  const dates: string[] = [];
  const series = [{
    name: 'Firewall Log Messages',
    data: [],
    className: 'al-gray-500',
    showInLegend: false,
    type: 'line'
  }, {
    name: 'Firewall Log Observations',
    data: [],
    className: 'al-blue-500',
    showInLegend: false,
    type: 'area'
  }, {
    name: 'Firewall Log Incidents',
    data: [],
    className: 'al-purple-500',
    showInLegend: false,
    type: 'area'
  }];

  response.rows.forEach((row) => {
    const parsedDate: Date = kalmDateStringToJSDate(row[Column.Date] as string);
    dates.push(getLocalShortDate(parsedDate));
    series[0].data.push(row[Column.Messages_Count]);
    series[1].data.push(row[Column.Observations_Count]);
    series[2].data.push(row[Column.Incidents_Count]);
  });

  return {
    title:  '',
    description: 'Firewall Log Volume Trends',
    dateOptions: dates,
    series: series
  };
};
