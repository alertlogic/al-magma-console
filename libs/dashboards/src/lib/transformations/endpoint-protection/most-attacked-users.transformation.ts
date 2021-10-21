import { Widget as WidgetConfig, TableListConfig, ZeroState, ZeroStateReason } from '@al/ng-visualizations-components';
import { AlEndpointsSummaryData } from '@al/endpoints';

interface SummaryResponse {
  summary: AlEndpointsSummaryData;
}

export const mostAttackedUsers = (response: SummaryResponse, item?: WidgetConfig): TableListConfig | ZeroState => {
  const attackedUsers = response.summary.usersWithIncidents;
  const totalAttacks = attackedUsers.map(user => user.protectCount + user.monitoredCount).reduce((a, b) => a + b, 0);
  if (totalAttacks === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const dataRows = attackedUsers.map(user => {
    const totalAttacksForUser = user.protectCount + user.monitoredCount;
    return {
      username: user.username,
      count: totalAttacksForUser,
      percent: `${Math.round((totalAttacksForUser / totalAttacks) * 100)}%`,
      recordLink: {
        search: user.username
      }
    };
  }).sort((a, b) =>  (a.count > b.count) ? -1 : 1);

  return {
    headers: [
      { name: 'User Name', field: 'username', class: 'left' },
      { name: 'Event Count', field: 'count', class: 'right' },
      { name: '% of Total', field: 'percent', class: 'right' }
    ],
    body: dataRows
  };
};
