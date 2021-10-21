import { Widget as WidgetConfig, TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  HostName,
  Country,
  City,
  Latitude,
  Longitude,
  IncidentCount
}

export const topAttackersByOccurrence = (response: {rows: any[];}, item?: WidgetConfig): TableListConfig | ZeroState => {
  const rows = response.rows;
  if (rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  return {
    headers: [
      {name: 'Attacker IP', field: 'ip', class: 'left'},
      {name: 'Count', field: 'count', class: 'right'},
      {name: 'Location', field: 'location', class: 'left'},
    ],
    body: rows.map(row => ({
      ip: row[Column.HostName],
      count: row[Column.IncidentCount],
      location: row[Column.Country] || row[Column.City],
      recordLink: {
        advancedSearchQuery: `SourceIP = "${row[Column.HostName]}" AND AttackerCountryName = "${row[Column.Country] || row[Column.City]}"`,
        startDate: '<start_date_time>',
        endDate: '<end_date_time>'
      },
    })).sort((a, b) => { // Sort by country
      const countryA: string = a.location.toUpperCase();
      const countryB: string = b.location.toUpperCase();
      if (countryA < countryB) return -1;
      if (countryA > countryB) return 1;
      return 0;
    }).sort((a, b) => { // Then by count
      return b.count - a.count;
    })
  };
};
