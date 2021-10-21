import { genericCountryDistribution } from '../generic/country_distribution.transformation';
import { Widget as WidgetConfig, MapDistributionDataSet } from '@al/ng-visualizations-components';
import { isAuthenticationIncident } from '../../dashboards.types';

/**
 * Process the data from iris and generates the proper config for genericCountryDistribution
 * @param response - Raw data from Iris
 * @param itemConfig - Layout config item
 */
export const authenticationIncidentSources = (response: any, itemConfig?: WidgetConfig): MapDistributionDataSet[] => {
  interface ColumnInfo {
    type: string;
    name: string;
  }
  interface Response {
    rows: any[];
    column_info: ColumnInfo[];
  }
  const countries = response.aggregations.createtime_str.date_period.attacker_country_name;
  const columnInfo: ColumnInfo[] = [
    {
      "type": "varchar",
      "name": "country_code"
    },
    {
      "type": "varchar",
      "name": "country"
    },
    {
      "type": "varchar",
      "name": "geo_type"
    },
    {
      "type": "int8",
      "name": "incidents_count"
    }
  ];

  const rows: unknown[] = Object.keys(countries).filter(country => country !== 'N/A').map((element: string) => {// take off the 'N/A' country names
    const countryCode: string = Object.keys(countries[element].attacker_country_code)[0];
    const incidentTypes: {} = countries[element]['incident.attackClassId_str'];
    const authenticationIncidents = Object.keys(incidentTypes).filter(item => isAuthenticationIncident(item));
    const reducer = (accumulator: number, currentValue: number): number => accumulator + currentValue;
    const count = authenticationIncidents.length === 0 ? 0 : authenticationIncidents.map(item => incidentTypes[item]).reduce(reducer);
    return [countryCode, element, 'country', count];
  });

  const genericResponse: Response = {
    "rows": rows,
    "column_info": columnInfo
  };

  return genericCountryDistribution(genericResponse, itemConfig);
};
