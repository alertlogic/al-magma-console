import { Widget as WidgetConfig, TableListConfig, ZeroState, ZeroStateReason } from '@al/ng-visualizations-components';
import { AlEndpointsSummaryData } from '@al/endpoints';
import { baseSemiCircleObject } from '../base_objects.transformation';

interface SummaryResponse {
  summary: AlEndpointsSummaryData;
}

export const protectionStatus = (response: SummaryResponse, item?: WidgetConfig) => {
    const primaryStateBreakdown = response.summary.stateBreakdown.primaryState;
    const secondaryStateBreakdown = response.summary.stateBreakdown.secondaryState;
    const on = primaryStateBreakdown.ON + secondaryStateBreakdown.INACTIVE_WITH_STATUS_ON;
    const off = primaryStateBreakdown.OFF + secondaryStateBreakdown.INACTIVE_WITH_STATUS_OFF;
    const error = primaryStateBreakdown.ERROR;

    const total = off + error + on;
    const config = Object.assign({}, baseSemiCircleObject);
    if ( total === 0 ) {
        return {
            nodata: true,
            reason: ZeroStateReason.Zero
        };
    } else {
        Object.assign(config.series[0], {data: [{
            name: 'On',
            y: on,
            className: 'al-green-500',
            recordLink: { filter: 'PROTECTION_ON'}
        }, {
            name: 'Error',
            y: error,
            className: 'al-orange-500',
            recordLink: { filter: 'ERRORS'}
          }, {
            name: 'Off',
            y: off,
            className: 'al-red-500',
            recordLink: { filter: 'PROTECTION_OFF'}
        }
      ]});
      return JSON.parse(JSON.stringify(config));
    }
};

