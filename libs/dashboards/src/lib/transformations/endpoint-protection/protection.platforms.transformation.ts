import { Widget as WidgetConfig, TableListConfig, ZeroState, ZeroStateReason } from '@al/ng-visualizations-components';
import { AlEndpointsSummaryData } from '@al/endpoints';

interface SummaryResponse {
  summary: AlEndpointsSummaryData;
}

export const protectionPlatforms = (response: SummaryResponse, item?: WidgetConfig) => {
  const seriesData = [];
  let totalOsCount = 0;
  response.summary.osBreakdown.forEach((osItem) => {
    const osCount = osItem.versions.reduce((a, b) => a + b.count, 0);
    const osName = osItem.os === 'Apple' ? 'mac' : 'windows';
    totalOsCount = totalOsCount + osCount;
    // New endpoints Summary API will return Windows and Windows Server as separate items
    // For now we have to combine these as one Windows segment in the chart
    const windowsSeries = seriesData.find(seriesItem => {
      return seriesItem.name === 'Windows';
    });
    if(windowsSeries && osName === 'windows') {
      windowsSeries.y += osCount;
    } else {
      seriesData.push({
        name: osName.charAt(0).toUpperCase() + osName.substring(1),
        y: osCount,
        className: `active-${osName}`,
        recordLink: { filter: osName.toUpperCase()}
      });
    }
  });

  if (totalOsCount === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  } else {
    return {
      series: [{
        data: seriesData
      }]
    };
  }
};
