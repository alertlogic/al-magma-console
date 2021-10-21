import { WidgetContentType, TableListConfig } from '@al/ng-visualizations-components';

interface Header {
  name: string;
  field: string;
  class: string;
}

type Row = [number, string];

/*
 *
 */
const headers: Header[] = [{
  name: "Source",
  field: "source",
  class: "left"
},
{
  name: "Denied Connections",
  field: "denied",
  class: "right"
}];


/*
 *
 */
function generateData(rows: Row[]): any {
  return rows.map((row: Row) => {
    return {
      source: row[0],
      denied: row[1]
    };
  });
}

/*
 *
 */
export const firewallSecurityOutboundConnections = (response: any, contentType?: WidgetContentType): TableListConfig => {
  const rows: Row[] = [...response.rows];
  const body = generateData(rows);

  return {
    headers,
    body
  };
};
