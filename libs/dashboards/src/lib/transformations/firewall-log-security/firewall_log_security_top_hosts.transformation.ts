import { TableListConfig } from '@al/ng-visualizations-components';

enum Column {
  Ip,
  Count
}

interface Header {
  name: string;
  field: string;
  class: string;
}

type Row = [string, number];

/*
 *
 */
const headers: Header[] = [{
  name: "Source",
  field: "source",
  class: "left"
},
{
  name: "Incidents",
  field: "incidents",
  class: "right"
}];

/**
 * Generate the data for transformations body
 * Includes in the 'recordlink' property: 'advancedSearchQuery', 'startDate', 'endDate'
 * @param rows - Data to process
 * @param type - Data type (e.g 'source' for SecurityTopHosts, and 'target' for SecurityTopHostsTarget)
 * @param searchField - Represents the incidents UI advance search field (e.g IP, DestinationIP, SourceIP)
 */
function generateData(rows: any, type: string,  searchField: string): any {
  return rows.map((row: any) => {
    const obj = {
      incidents: row[Column.Count],
      recordLink: {
        advancedSearchQuery: `${searchField} = "${row[Column.Ip]}"`,
        startDate: '<start_date_time>',
        endDate: '<end_date_time>'
      }
    };
    obj[type] = row[0];
    return obj;
  });
}

/**
 * Generates rows given Iris data
 * rows sorting by count - desc
 */
function generateRows(data): Row[] {
  return Object.keys(data).map((item: string) => {
    return [item, data[item] as number] as Row;
  }).sort((a,b) => b[Column.Count] - a[Column.Count]);
}

/**
 * firewallSecurityTopHosts transformation
 * @param response - Raw data from API
 */
export const firewallSecurityTopHosts = (response: any): TableListConfig => {
  const data = response.aggregations.createtime_str.date_period.attackers;
  const rows: Row[] = generateRows(data);
  const body = generateData(rows, 'source', 'SourceIP');
  return {
    headers,
    body
  };
};

/**
 * firewallSecurityTopHostsTarget transformation
 * @param response - Raw data from API
 */
export const firewallSecurityTopHostsTarget =  (response: any): TableListConfig => {
  const data = response.aggregations.createtime_str.date_period.victims;
  const rows: Row[] = generateRows(data);
  const body = generateData(rows, 'target', 'DestinationIP');
  return {
    body,
    headers: [{ name: "Target", field: "target", class: "left" }, ...headers.slice(1)]
  };
};
