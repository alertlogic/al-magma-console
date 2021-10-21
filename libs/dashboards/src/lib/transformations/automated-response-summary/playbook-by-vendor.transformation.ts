import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderPlaybookSummary } from '@al/responder';

export const playbookByVendor = (response: AlResponderPlaybookSummary, item?: WidgetConfig) => {

  const summary = response?.summary?.['playbook_vendors'] || [];
  if (summary.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  const summaryPlain =  summary.map(item => Object.entries(item)[0]);
  const sorted = summaryPlain.sort((a, b) => {
    return b[1] - a[1];
  });
  const firstTen = sorted.slice(0, 10);
  const assetNames: string[] = firstTen.map(item => item[0] as string);
  const seriesData = firstTen.map(item => {
    return { y: item[1], className: 'al-blue-500' };
  });

  return {
    dateOptions: assetNames,
    description: "Playbooks Count",
    inverted: true,
    yAxisType: "linear",
    tooltipString: '{{name}}: {{value}}',
    series: [{
      type: "column",
      data: seriesData,
      showInLegend: false
    }]
  };
};
