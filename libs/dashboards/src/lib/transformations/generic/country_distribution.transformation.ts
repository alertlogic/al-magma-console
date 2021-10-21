import { Widget as WidgetConfig, MapDistributionDataItem, MapDistributionDataSet } from '@al/ng-visualizations-components';

interface ColumnInfo {
  type: string;
  name: string;
}

interface Response {
  rows: any[];
  column_info: ColumnInfo[];
}

/*
 *
 */
const getIndex = (columnInfo: ColumnInfo[], term: string): number | null => {
  const index: number = columnInfo.findIndex((item: ColumnInfo) => {
    if (/^like:/.test(term)) {
      const like: string = term.match(/[a-z]+$/ig)[0];
      return item.name.toLowerCase().endsWith(like);
    } else {
      return item.name === term;
    }
  });
  return index >= 0 ? index : null;
};


/*
 *
 */
const buildIndexes = (columnInfo: ColumnInfo[]) => {
  return {
    name: getIndex(columnInfo, 'country'),
    value: getIndex(columnInfo, 'like:count'),
    lon: getIndex(columnInfo, 'longitude'),
    lat: getIndex(columnInfo, 'latitude'),
    country_code: getIndex(columnInfo, 'country_code'),
    geo_type: getIndex(columnInfo, 'geo_type')
  };
};

/*
 *
 */
export const genericCountryDistribution = (response: Response | Response[], itemConfig?: WidgetConfig): MapDistributionDataSet[] => {
  let responses: Response[] = [];
  // Coerce the reponse to an array if it comes back as a single object
  if (!Array.isArray(response)) {
    responses.push(response);
  } else {
    responses = [...response];
  }

  const indexes = buildIndexes(responses[0].column_info);
  const ret: MapDistributionDataSet[] = [];

  for (const item of responses) {
    const countries = item.rows.filter((row: any) => row[indexes.geo_type] === 'country');
    ret.push(
      countries.map((country: any) => {
        let obj = {
          name: country[indexes.name],
          code: country[indexes.country_code],
          value: country[indexes.value],
          recordLink: {
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
          }
        };
        /**
         * Drilldown set up e.g:
         * "drilldown_settings": {
              "drilldown_key": "advancedSearchQuery",
              "filter_name": "AttackerCountryName",
              "value": "name"
            }
         */
        try {
          const drillDownSetting: {[k:string]:string} = itemConfig['presentation'].drilldown_settings;
          const drillDownKey: string = drillDownSetting.drilldown_key;
          const filterName: string = drillDownSetting.filter_name;
          const filterValue: string = drillDownSetting.value;
          obj.recordLink[drillDownKey] =  `${filterName} = "${country[indexes[filterValue]]}"`;
        } catch (error) {
          obj.recordLink["term"] = country[indexes.name];
        }

        if (indexes.lon) {
          obj = Object.assign(obj, {coords: {
            lon: country[indexes.lon],
            lat: country[indexes.lat]
          }});
        }

        return obj;
      }) as MapDistributionDataItem[]
    );
  }

  return ret;
};


/**
 * genericCountryDistributionDataFromIris transformation
 * This function get the data from Iris and generates the structure used
 * in "genericCountryDistribution" transformation
 * service method: getAggregationsForFields
 * query example (fields property):
 * NOTE: you must follow this structure in order to generate the correct data
 * "fields":[
      {
         "type":"date_range",
         "sub":[
			{
			    "name": "attacker_country_name",
			    "sub": [
			      {
			        "name": "attacker_country_code"
			      }
			    ]
			}
         ],
         "ranges":[
            {
               "to":"2020-05-19T04:59:59.999Z",
               "key":"date_period",
               "from":"2020-05-04T05:00:00.000Z"
            }
         ],
         "name":"createtime_str"
      }
   ]
 * @param response - Raw data from Iris
 * @returns MapDistributionDataSet
 */
export const genericCountryDistributionDataFromIris = (response: any, itemConfig?: WidgetConfig): MapDistributionDataSet[] => {
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

  const rows: unknown[] = Object.keys(countries).filter(country => country !== 'N/A').map((element: string) => {
    const countryCode: string = Object.keys(countries[element].attacker_country_code)[0];
    const count: number = countries[element].count;
    return [countryCode, element, 'country', count];
  });

  const genericResponse: Response = {
    "rows": rows,
    "column_info": columnInfo
  };

  return genericCountryDistribution(genericResponse, itemConfig);
};
