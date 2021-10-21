import { Widget as WidgetConfig, TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  AttackerIp,
  IncidentCount,
  Country,
}

export const topAttackersByOccurrenceIris = (response: any , item?: WidgetConfig): TableListConfig | ZeroState => {
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
      ip: row[Column.AttackerIp],
      count: row[Column.IncidentCount],
      location: row[Column.Country],
      recordLink: {
        advancedSearchQuery: `SourceIP = "${row[Column.AttackerIp]}" AND AttackerCountryName = "${row[Column.Country]}"`,
        startDate: '<start_date_time>',
        endDate: '<end_date_time>'
    },
    })).sort((a, b) => { // Sort by count
      return b.count - a.count;
    }).slice(0,10) // Take 10
  };
};
