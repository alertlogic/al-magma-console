import { Widget as WidgetConfig, MapDistributionDataItem, MapDistributionDataSet } from '@al/ng-visualizations-components';

enum Column {
  Country,
  City,
  Latitude,
  Longitude,
  GeoType,
  Count
}

/*
 * TODO start returning code (2 char iso country code) when back end supports it
 */
export const incidentsDistributionBySource = (response: {rows: any[];}): MapDistributionDataSet[] => {
  const countries: any[] = response.rows.filter((row: any) => row[Column.GeoType] === 'country');
  return [countries.map((country: any) => {
    return {
      name: country[Column.Country],
      value: country[Column.Count],
      coords: {
        lon: country[Column.Longitude],
        lat: country[Column.Latitude]
      },
      recordLink: {
          term: country[Column.Country],
          startDate: '<start_date_time>',
          endDate: '<end_date_time>'
      }
    };
  }) as MapDistributionDataItem[]];
};
