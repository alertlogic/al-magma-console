import { Widget as WidgetConfig, ZeroStateReason, WidgetContentType } from '@al/ng-visualizations-components';


interface Data {
  className: string;
  name: string;
  value: number;
  y: number;
  recordLink: {
    threat: string;
    startDate: string;
    endDate: string;
  };
}

const classLookup = {
  critical: 'critical',
  high: 'medium',
  medium: 'low',
  low: 'info'
};

const order = ['Critical', 'High', 'Medium', 'Low'];

/*
 *
 */
function generateClass(name: string): string {
  const compare: string = name.toLowerCase();
  return classLookup[compare] || 'info2';
}

/*
 *
 */
function generateData(rows): Data[] {
  return rows.map((row) => {
    return {
      name: row[0],
      className: generateClass(row[0]),
      value: row[1],
      recordLink: {
        threat: row[0],
        startDate: '<start_date_time>',
        endDate: '<end_date_time>'
      },
      y: row[1]
    };
  });
}

/*
 *
 */
export const firewallSecurityIncidentThreat = (response: any, contentType?: WidgetContentType) => {
  const threatRating = response.aggregations.createtime_str.date_period['incident.threatRating'];
  const rows = Object.keys(threatRating).map((item: string) => {
    return [item, threatRating[item]];
  });
  const data = generateData(rows);
  if (data.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }
  const seriesData = order.map((item: string) => {
    return data.find((severityItem: Data) => severityItem.name === item);
  }).filter((item) => item !== undefined);

  return {
    series: [{
      data: seriesData
    }]
  };
};
