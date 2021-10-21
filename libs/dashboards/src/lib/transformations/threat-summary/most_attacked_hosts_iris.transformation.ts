import { Widget as WidgetConfig, TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';
import { threatRatingLevels } from '../../dashboards.types';

enum Column {
  HostName,
  HostIncidentCount,
  DeploymentName,
  WorstStatus,
  VictimIp
}

export const mostAttackedHostsIris = (response: any, item?: WidgetConfig): TableListConfig | ZeroState => {
  const assets = [];
  let totalCount = 0;

  const returnZeroState = (): {nodata: boolean, reason: number} => {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  };

  try {
    const datePeriod = response.aggregations.createtime_str.date_period;
    const victims = datePeriod.victims;
    totalCount = datePeriod.count;

    // I am going to fill the list iterating for each 'hostName' and each 'assets.al__deployment',
    // that is: If I have 'n' different kinds of 'assets.al__deployment' for the same 'hostName',
    // I am going to create 'n' records and 'n' records for each 'hostName'
    // The threatRating will be the worst e.g {Medium, Critical} = Critical
    const victimsKeys = Object.keys(victims);

    victimsKeys.forEach((victimKey: string) => {
      const hostNames = victims[victimKey].asset_host_name;
      const hostNamesKeys = Object.keys(hostNames);
      hostNamesKeys.forEach((hostNameKey: string) => {
        const deployments = hostNames[hostNameKey]['assets.al__deployment'];
        const deploymentsKeys = Object.keys(deployments);
        deploymentsKeys.forEach((deploymentKey: string) => {
          const threatRating = deployments[deploymentKey]['incident.threatRating'];
          const threatRatingKeys = Object.keys(threatRating);
          const worstThreatLevel = threatRatingKeys.sort((a,b) => {
            return threatRatingLevels[b] - threatRatingLevels[a];
          })[0];
          if (worstThreatLevel) {
            const worstThreatLevelCount: number = deployments[deploymentKey]['incident.threatRating'][worstThreatLevel];
            assets.push([hostNameKey, worstThreatLevelCount, deploymentKey, worstThreatLevel, victimKey]);
          }
        });
      });
    });
  } catch (error) {
    return returnZeroState();
  }

  if (assets.length === 0) {
    return returnZeroState();
  }

  return {
    headers: [
      { name: 'Target', field: 'targetIp', class: 'left' },
      { name: 'Host Name', field: 'host', class: 'left' },
      { name: 'Count', field: 'count', class: 'right' },
      { name: 'Deployment', field: 'deployment', class: 'left' },
      { name: 'Worst Threat Level', field: 'status', class: 'left status' },
      { name: '% of Total Attacks', field: 'percent', class: 'right' }
    ],
    body: assets.map((asset) => {
      const host: string = asset[Column.HostName];
      const deployment: string = asset[Column.DeploymentName];
      const status: string = asset[Column.WorstStatus];
      const count: number = asset[Column.HostIncidentCount];
      const targetIp: string = asset[Column.VictimIp];
      return {
        targetIp,
        host,
        count,
        deployment,
        status: status.toLowerCase(),
        percent: `${((asset[Column.HostIncidentCount] / totalCount) * 100).toFixed(2)}%`,
        recordLink: {
          deployment,
          threat: status,
          advancedSearchQuery: `HostName = "${host}" AND DestinationIP = "${targetIp}"`,
          startDate: '<start_date_time>',
          endDate: '<end_date_time>'
        }
    };
  }).sort((a, b) => { // Sort by count
      return b.count - a.count;
    }).slice(0,20) // Take 20
  };
};
