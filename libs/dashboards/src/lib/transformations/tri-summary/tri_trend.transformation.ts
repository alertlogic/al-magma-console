import { ZeroStateReason } from '@al/ng-visualizations-components';

enum Column {
  Date,
  TriScrore
}

export const triTrend = (response: {rows: any[];}) => {
  const rows: any[] = response.rows;
  if (rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const dateOptions: string[] = response.rows.map((row) => {
    const splitDate: string[] = (row[Column.Date] as string).split("-");// date from BI: "2020-10-19"
    const year: number = parseInt(splitDate[0], 10);
    const month: number = parseInt(splitDate[1], 10) === 0 ? 0 : parseInt(splitDate[1], 10) - 1;
    const date: number = parseInt(splitDate[2], 10);
    const parsedDate: Date = new Date(year,month,date);
    return parsedDate.toLocaleDateString([], {day: '2-digit', month:'short'});
  });

  const data: any[] = response.rows.map((row, idx) => {
    return {
      x: idx,
      y: row[Column.TriScrore]
    };
  });

  const total: number = data.reduce((a, b) => a + b.y, 0);
  const dataSeries: any[] = total > 0
    ? [{
      name: 'Overall TRI Score',
      data: data,
      showInLegend: false
    }]
    : [];

  return {
    dateOptions,
    description: "Overall TRI Score",
    tooltipString: '{{name}}: {{value:2dp}}',
    series: dataSeries
  };
};
