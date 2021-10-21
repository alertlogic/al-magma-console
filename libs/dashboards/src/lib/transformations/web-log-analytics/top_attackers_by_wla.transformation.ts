import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  HostName,
  IncidentCount,
  Country,
}

/**
 * topAttackersByOccurrenceWla transformation
 * service method: getAggregationsForFields
 * query (fields property):
 * "type":"date_range",
         "sub":[
            {
               "name":"attackers",
               "sub":[
                  {
                     "name":"attacker_country_name"
                  }
               ]
            }
         ],
 * @param response - Raw data from Iris
 */
export const topAttackersByOccurrenceWla = (response: any): TableListConfig | ZeroState => {
  const attackers = response.aggregations.createtime_str.date_period.attackers;
  if (Object.keys(attackers).length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const rows = [];
  Object.keys(attackers).forEach((attackerIp: string) => {
    const attackerCountry = attackers[attackerIp].attacker_country_name;
    const countries: string[] = Object.keys(attackerCountry);
    countries.forEach(country => {// Display everything (keeping N/A results)
      rows.push([attackerIp, attackerCountry[country], country]);
    });
  });

  return {
    headers: [
      {name: 'Attacker', field: 'ip', class: 'left'},
      {name: 'Count', field: 'count', class: 'right'},
      {name: 'Location', field: 'location', class: 'left'},
    ],
    body: rows.map(row => ({
      ip: row[Column.HostName],
      count: row[Column.IncidentCount],
      location: row[Column.Country],
      recordLink: {
        advancedSearchQuery: `SourceIP = '${row[Column.HostName]}' AND AttackerCountryName = '${row[Column.Country]}'`,
        source: 'WLA',
        startDate: '<start_date_time>',
        endDate: '<end_date_time>'
    },
    })).sort((a, b) => { // Sort by count
      return b.count - a.count;
    }).splice(0,10)// Take 10
  };
};
