import { Widget as WidgetConfig, TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';
import { getTotalForKeys, highlightSeverity, highlightValue, highlightRiskLevel } from '../transformation.utilities';

enum Column {
  AccountId,
  AccountName,
  AvgDays,
  Counts
}

export const securityScorecard = (response: {rows: any[];}, item?: WidgetConfig): TableListConfig | ZeroState => {
  const rows = response.rows;
  if (rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  return {
    headers: [
      {name: 'Account', field: 'account', class: 'align-left'},
      {name: 'Open Incidents', field: 'incidents', class: 'align-center'},
      {name: 'Critical & High Incidents', field: 'criticalHighIncidents', class: 'align-center'},
      {name: 'Critical & High Incidents %', field: 'criticalHighIncidentsPercent', class: 'align-center'},
      {name: 'Overall TRI Score', field: 'tri', class: 'align-center'},
      {name: 'Open Vulns', field: 'vulns', class: 'align-center'},
      {name: 'Security Remediations', field: 'remediations', class: 'align-center'},
      {name: 'Average Vulnerability Age (in Days)', field: 'avgVulnAge', class: 'align-center'},

    ],
    body: rows.map(row => {
      const totalIncidents = getTotalForKeys(row[Column.Counts].incident);
      const totalCriticalHighIncidents = getTotalForKeys(row[Column.Counts].incident, ['Critical', 'High']);
      const totalVulns = getTotalForKeys(row[Column.Counts].vulnerability);
      const totalRemediations = getTotalForKeys(row[Column.Counts].remediation);
      const totalCriticalHighIncidentsPercentage = ((totalCriticalHighIncidents / totalIncidents) * 100);
      const accountId = row[Column.AccountId];
      return {
        account: `${row[Column.AccountName]} (${accountId})`,
        incidents: totalIncidents > 0 ? {
          value: totalIncidents,
          recordLink: {
            target_app: "cd17:incidents",
            path: '/#/incidents/:accountId/open',
            query_params: {
              startDate: '<start_date_time>',
              endDate: '<end_date_time>',
              aaid: `${accountId}`
            }
          }
        } : 0,
        criticalHighIncidents: totalCriticalHighIncidents > 0 ? {
          value: totalCriticalHighIncidents,
          cssName: highlightSeverity(row[Column.Counts].incident, true),
          recordLink: {
            target_app: "cd17:incidents",
            path: '/#/incidents/:accountId/open',
            query_params: {
              advancedSearchQuery: 'ThreatLevel IN ("Critical", "High")',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>',
              aaid: `${accountId}`
            }
          }
        } : 0,
        criticalHighIncidentsPercent: totalCriticalHighIncidents > 0 ? {
          value: totalCriticalHighIncidentsPercentage.toFixed(1),
          cssName: `${highlightValue(totalCriticalHighIncidentsPercentage, {high: 10, medium: 1})} percentage`,
          recordLink: {
            target_app: "cd17:incidents",
            path: '/#/incidents/:accountId/open',
            query_params: {
              advancedSearchQuery: 'ThreatLevel IN ("Critical", "High")',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>',
              aaid: `${accountId}`
            }
          }
        } : '0 %',
        tri: {
          value: row[Column.Counts].tri.Score,
          cssName: highlightRiskLevel(row[Column.Counts].tri.Severity),
          recordLink: {
            target_app: "cd17:exposures",
            path: '/#/exposures/open/:accountId',
            query_params: {
              aaid: `${accountId}`,
              category: 'security'
            }
          }
        },
        vulns: totalVulns > 0 ? {
          value: totalVulns,
          cssName: highlightSeverity(row[Column.Counts].vulnerability),
          recordLink: {
            target_app: "cd17:exposures",
            path: '/#/exposures/open/:accountId',
            query_params: {
              aaid: `${accountId}`,
              category: 'security'
            }
          }
        } : 0,
        remediations: totalRemediations > 0 ? {
          value: totalRemediations,
          recordLink: {
            target_app: "cd17:exposures",
            path: '/#/remediations/open/:accountId',
            query_params: {
              aaid: `${accountId}`,
              category: 'security'
            }
          }
        } : 0,
        avgVulnAge: {
          value: row[Column.AvgDays].vulnerability,
          cssName: highlightValue(row[Column.AvgDays].vulnerability, {high: 31, medium: 15})
        }
      };
    }),
    sortable: true,
    defaultSortField: 'account',
    defaultSortOrder: 1
  };
};
