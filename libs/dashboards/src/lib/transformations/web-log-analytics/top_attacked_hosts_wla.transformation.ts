import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  Host,
  AttackClass,
  AttackerIp,
  Count,
  VictimIp
}

/**
 * mostAttackedHostsByWla transformation
 * method: getAggregationsForFields
 * service: Iris
 * "fields" property query:
 * "type": "date_range",
   "sub": [
    {
      "name": "victims",
      "sub": [
        {
          "name": "asset_host_name",
          "sub": [
            {
              "name": "attackers",
              "sub": [
                {
                  "name": "incident.attackClassId_str"
                }
              ]
            }
          ]
        }
      ]
    }
 * @param response - Raw data from Iris
 */
export const mostAttackedHostsByWla = (response: any): TableListConfig | ZeroState => {
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
    const victims = datePeriod.victim_any;
    totalCount = datePeriod.count;

    // I am going to fill the list iterating for each 'attackClass' and each 'attackerIp',
    // that is: If I have 'n' different kinds of 'attackClass' for the same 'attackerIp',
    // I am going to create 'n' records and 'n' records for each 'attackerIp'.
    const victimsKeys = Object.keys(victims);

    victimsKeys.forEach((victimKey: string) => {
      const hostNames = victims[victimKey].asset_host_name;
      const hostNamesKeys = Object.keys(hostNames);
      hostNamesKeys.forEach((hostNameKey: string) => {
        const attackers = hostNames[hostNameKey].attackers;
        const attackersKeys = Object.keys(attackers);
        attackersKeys.forEach((attackerKey: string) => {
          const attackClasses = attackers[attackerKey]['incident.attackClassId_str'];
          const attackClassesKeys = Object.keys(attackClasses);
          attackClassesKeys.forEach((attackClass: string) => {
            const count: number = attackClasses[attackClass];
            assets.push([hostNameKey, attackClass, attackerKey, count, victimKey]);
          });
        });
      });
    });
  } catch(error) {
    return returnZeroState();
  }
  // Zero state validation
  if (assets.length === 0) {
    return returnZeroState();
  }

  return {
    headers: [
      { name: 'Host/VHost', field: 'targetIp', class: 'left' },
      { name: 'Host Name', field: 'host', class: 'left' },
      { name: 'Attack Class', field: 'attackClass', class: 'left' },
      { name: 'Attacker IP', field: 'attackerIp', class: 'left' },
      { name: 'Count', field: 'count', class: 'right' },
      { name: '% of Total', field: 'percent', class: 'right' }
    ],
    body: assets.map((asset) => {
      const host: string = asset[Column.Host];
      const attackerIp: string = asset[Column.AttackerIp];
      const attackClass: string = asset[Column.AttackClass];
      const count: number = asset[Column.Count];
      const targetIp: string = asset[Column.VictimIp];
      return {
        targetIp,
        host,
        attackClass,
        attackerIp,
        count,
        recordLink: {
          category: attackClass,
          advancedSearchQuery: `Destination = "${targetIp}" AND HostName = "${host}" AND SourceIP = "${attackerIp}"`,
          startDate: '<start_date_time>',
          endDate: '<end_date_time>'
        },
        percent: `${((count / totalCount) * 100).toFixed(2)}%`
      };
    }).sort((a,b) => b.count - a.count).splice(0,20)// Sort and take just 20 records
  };
};
