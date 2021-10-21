import { Widget as WidgetConfig, TableListConfig, ZeroState, ZeroStateReason } from '@al/ng-visualizations-components';
import { AlEndpointsSummaryData } from '@al/endpoints';

interface SummaryResponse {
  summary: AlEndpointsSummaryData;
}

export const mostAttackedEndpoints = (response: SummaryResponse, item?: WidgetConfig): TableListConfig | ZeroState => {
  const attackedEndpoints = response.summary.endpointsWithIncidents;
  const totalAttacks = attackedEndpoints.map(endpoint => endpoint.protectCount + endpoint.monitoredCount).reduce((a, b) => a + b, 0);
  if (totalAttacks === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const dataRows = attackedEndpoints.map(endpoint => {
    const totalAttacksForEndpoint = endpoint.protectCount + endpoint.monitoredCount;
    return {
      endpoint: endpoint.endpointName,
      count: totalAttacksForEndpoint,
      percent: `${Math.round((totalAttacksForEndpoint / totalAttacks) * 100)}%`,
      recordLink: {
        search: endpoint.endpointName
      }
    };
  }).sort((a, b) =>  (a.count > b.count) ? -1 : 1);

  return {
    headers: [
      { name: 'Endpoint Name', field: 'endpoint', class: 'left multiline-content' },
      { name: 'Event Count', field: 'count', class: 'right' },
      { name: '% of Total', field: 'percent', class: 'right' }
    ],
    body: dataRows
  };
};
