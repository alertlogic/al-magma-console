import { securityScorecard } from './security_scorecard.transformation';
import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';


describe('Security Scorecard Test Suite', () => {
  describe('Given a security scorecard response', () => {
    it('should return a correcly constructed TableListConfig object', () => {
      const response = {
          rows: [[
            134265794,
            'AWS TOS',
            {
              vulnerability: 31,
              tri: 0,
              remediation: 0,
              incident: 0
            },
            {
              vulnerability: {
                Medium: 19,
                Low: 0,
                Info: 0,
                High: 0,
                Critical: 0
              },
              tri: {
                Severity:  1,
                Score: 1.5
              },
              remediation: {
                Open: 10
              },
              incident: {
                Medium: 19,
                Low: 0,
                Info: 0,
                High: 0,
                Critical: 1
              }
            }
          ]]
      };
      expect(securityScorecard(response)).toEqual({
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
        body: [{
          account: 'AWS TOS (134265794)',
          incidents: {
            value: 20,
            recordLink: {
              target_app: 'cd17:incidents',
              path: '/#/incidents/:accountId/open',
              query_params: {
                startDate: '<start_date_time>',
                endDate: '<end_date_time>',
                aaid: '134265794'
              }
            }
          },
          criticalHighIncidents: {
            value: 1,
            cssName: 'highlight risk-critical',
            recordLink: {
              target_app: "cd17:incidents",
              path: '/#/incidents/:accountId/open',
              query_params: {
                advancedSearchQuery: 'ThreatLevel IN ("Critical", "High")',
                startDate: '<start_date_time>',
                endDate: '<end_date_time>',
                aaid: '134265794'
              }
            }
          },
          criticalHighIncidentsPercent: {
            value: '5.0',
            cssName: 'highlight medium percentage',
            recordLink: {
              target_app: "cd17:incidents",
              path: '/#/incidents/:accountId/open',
              query_params: {
                advancedSearchQuery: 'ThreatLevel IN ("Critical", "High")',
                startDate: '<start_date_time>',
                endDate: '<end_date_time>',
                aaid: '134265794'
              }
            }
          },
          tri: {
            value: 1.5,
            cssName: 'highlight risk-low',
            recordLink: {
              target_app: "cd17:exposures",
              path: '/#/exposures/open/:accountId',
              query_params: {
                aaid: '134265794',
                category: 'security'
              }
            }
          },
          vulns: {
            value: 19,
            cssName: 'highlight medium',
            recordLink: {
              target_app: "cd17:exposures",
              path: '/#/exposures/open/:accountId',
              query_params: {
                aaid: '134265794',
                category: 'security'
              }
            }
          },
          remediations: {
            value: 10,
            recordLink: {
              target_app: "cd17:exposures",
              path: '/#/remediations/open/:accountId',
              query_params: {
                aaid: '134265794',
                category: 'security'
              }
            }
          },
          avgVulnAge: {
            value: 31,
            cssName: 'highlight high'
          }
        }],
        sortable: true,
        defaultSortField: 'account',
        defaultSortOrder: 1
      } as TableListConfig);
    });
  });
  describe('with zero counts for some of the fields', () => {
    it('should return a correcly constructed TableListConfig object', () => {
      const response = {
          rows: [[
            134265794,
            'AWS TOS',
            {
              vulnerability: 0,
              tri: 0,
              remediation: 0,
              incident: 0
            },
            {
              vulnerability: {
                Medium: 0,
                Low: 0,
                Info: 0,
                High: 0,
                Critical: 0
              },
              tri: {
                Severity:  1,
                Score: 1.5
              },
              remediation: {
                Open: 0
              },
              incident: {
                Medium: 0,
                Low: 0,
                Info: 0,
                High: 0,
                Critical: 0
              }
            }
          ]]
      };
      expect(securityScorecard(response)).toEqual({
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
        body: [{
          account: 'AWS TOS (134265794)',
          incidents: 0,
          criticalHighIncidents: 0,
          criticalHighIncidentsPercent: '0 %',
          tri: {
            value: 1.5,
            cssName: 'highlight risk-low',
            recordLink: {
              target_app: "cd17:exposures",
              path: '/#/exposures/open/:accountId',
              query_params: {
                aaid: '134265794',
                category: 'security'
              }
            }
          },
          vulns: 0,
          remediations: 0,
          avgVulnAge: {
            value: 0,
            cssName: 'highlight acceptable'
          }
        }],
        sortable: true,
        defaultSortField: 'account',
        defaultSortOrder: 1
      } as TableListConfig);
    });
  });
  describe('containing zero rows of data', () => {
    it('should return a ZeroState response object', () => {
      const response = {
          rows: []
      };
      expect(securityScorecard(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero,
      } as ZeroState);
    });
  });
});
