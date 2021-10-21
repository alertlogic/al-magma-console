import { Widget as WidgetConfig, ZeroStateReason, WidgetContentType } from '@al/ng-visualizations-components';

type Row = [string, number];

interface Data {
  className: string;
  y: number;
  recordLink: {
    category: string;
    startDate: string;
    endDate: string;
  };
}

/*
 *
 */
function generateData(rows): Data[] {
  return rows.map((row) => {
    return {
      y: row[1],
      className: 'al-blue-400',
      recordLink: {
        category: row[0],
        startDate: '<start_date_time>',
        endDate: '<end_date_time>'
      },
    };
  });
}

/*
 *
 */
export const firewallSecurityIncidentTypes = (response: any, contentType?: WidgetContentType) => {
  const attackClasses = response.aggregations.createtime_str.date_period['incident.attackClassId_str'];
  const rows: Row[] = Object.keys(attackClasses).map((item: string) => {
    return [item, attackClasses[item] as number] as Row;
  });
  const data = generateData(rows);
  if (data.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }
  const dateOptions: string[] = rows.map((row) => row[0]);
  return {
    title: '',
    description: 'Count of Incidents',
    dateOptions: dateOptions,
    inverted: true,
    yAxisType: 'linear',
    series: [{
      data,
      type: 'column',
      showInLegend: false,
    }]
  };
};
