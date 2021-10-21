import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import { AlEndpointsSummaryData } from '@al/endpoints';
import { baseSemiCircleObject } from '../base_objects.transformation';

interface SummaryResponse {
  summary: AlEndpointsSummaryData;
}

export const protectionVersionStatus = (response: SummaryResponse, item?: WidgetConfig) => {
    const current = response.summary.currencyBreakdown.current;
    const outOfDate = response.summary.currencyBreakdown.outOfDate;
    const config = Object.assign({}, baseSemiCircleObject);
    if ( current + outOfDate === 0 ) {
        return {
            nodata: true,
            reason: ZeroStateReason.Zero
        };
    } else {
        Object.assign(config.series[0], {data: [{
            name: 'Up-to-date',
            y: current,
            className: 'healthy',
            recordLink: { filter: 'UP_TO_DATE'}
          }, {
            name: 'Out-of-date',
            y: outOfDate,
            className: 'unhealthy',
            recordLink: { filter: 'OUT_OF_DATE'}
        }
      ]});
      return JSON.parse(JSON.stringify(config));
    }
};
