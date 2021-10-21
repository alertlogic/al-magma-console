import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

enum Column {
  Ts,
  AttackType,
  VHost,
  SourceIp,
  UserAgent,
  StatusCode,
  Trigger,
  Count
}

/**
 * topObservations transformation
 * kalm: dashboards_wla_top_observations
 * @param response - Raw data from API
 */
export const topObservations = (response: {rows:any[], column_info:any[]}): TableListConfig | ZeroState => {

  if (response.rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  return {
    headers: [
      {
        "name": "Date",
        "field": "ts",
        "class": "left"
      },
      {
        "name": "Attack Type",
        "field": "attackType",
        "class": "left"
      },
      {
        "name": "Host/VHost",
        "field": "hostvhost",
        "class": "left"
      },
      {
        "name": "Source IP",
        "field": "srcIp",
        "class": "left"
      },
      {
        "name": "Count",
        "field": "count",
        "class": "right"
      },
      {
        "name": "User Agent",
        "field": "userAgent",
        "class": "left"
      },
      {
        "name": "Status Code",
        "field": "statusCode",
        "class": "left"
      },
      {
        "name": "Request",
        "field": "trigger",
        "class": "left"
      }
    ],
    body: response.rows.map((asset) => ({
      ts: asset[Column.Ts],
      attackType: asset[Column.AttackType],
      hostvhost: asset[Column.VHost],
      srcIp: asset[Column.SourceIp],
      count: asset[Column.Count],
      userAgent: asset[Column.UserAgent],
      statusCode: asset[Column.StatusCode],
      trigger: asset[Column.Trigger]
    })).sort((a, b) => { // Sort by ts date desc
      return new Date(b.ts).getTime() - new Date(a.ts).getTime();
    })
  };
};
