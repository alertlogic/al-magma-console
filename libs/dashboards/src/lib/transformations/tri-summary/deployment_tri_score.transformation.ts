import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';

export const deploymentTriScore = (response: {rows: any[];}, item?: WidgetConfig) => {

  enum Column {
    AssetName,
    TriScore
  }
  const assetNames: string[] = [];
  const seriesData = [];
  let totalCount = 0 ;
  response.rows.forEach((row) => {
    assetNames.push(row[Column.AssetName]);
    seriesData.push({y: row[Column.TriScore], className: 'al-blue-400'});
    totalCount = totalCount + row[Column.TriScore];
  });
  if (totalCount === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }
  return {
    dateOptions: assetNames,
    description: "TRI Score",
    inverted: true,
    yAxisType: "linear",
    tooltipString: '{{name}}: {{value:2dp}}',
    series: [{
      type: "column",
      data: seriesData,
      showInLegend: false
    }]
  };
};
