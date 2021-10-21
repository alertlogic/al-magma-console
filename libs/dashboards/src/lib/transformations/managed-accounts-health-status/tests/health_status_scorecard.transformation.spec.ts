import { healthStatusScorecard } from '../health_status_scorecard.transformation';
import { TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';

describe('Security Scorecard Test Suite', () => {
  describe('Given a security scorecard response', () => {
    it('should return a correcly constructed TableListConfig object', () => {
      const response = {
          rows: [[
            134265794,
            'AWS TOS',
            {
              network_status: 0,
              missing_agent: 0,
              endpoint_protection: 0,
              configuration_remediation: 45,
              asset_scanned: 0,
              appliance_status: 0,
              agent_status: 0
            },
            {
              network_status: {
                Unhealthy: 0,
                Healthy: 1
              },
              missing_agent: {
                Missing: 1
              },
              endpoint_protection: {
                protected: 0
              },
              configuration_remediation: {
                Remediations: 3
              },
              asset_scanned: {
                Unscanned: 15,
                Scanned: 15
              },
              appliance_status: {
                Unhealthy: 0,
                Healthy: 1
              },
              agent_status: {
                Unhealthy: 0,
                Healthy: 1
              }
            }
          ]]
      };
      expect(healthStatusScorecard(response)).toEqual({
        headers: [
          {name: 'Account', field: 'account', class: 'align-left'},
          {name: 'Protected Network Status', field: 'networkProtection', class: 'align-center'},
          {name: 'Appliance Collection Status', field: 'applianceStatus', class: 'align-center'},
          {name: 'Agent Collection Status', field: 'agentStatus', class: 'align-center'},
          {name: 'Unhealthy Hosts with No Agent', field: 'missingAgents', class: 'align-center'},
          {name: 'Configuration Remediations', field: 'remediations', class: 'align-center'},
          {name: 'Assets Scanned %', field: 'assetsScanned', class: 'align-center'},
          {name: 'Average Remediation Age', field: 'avgRemediationAge', class: 'align-center'},
        ],
        body: [{
          account: 'AWS TOS (134265794)',
          networkProtection: {
            value: 100,
            cssName: 'highlight acceptable percentage',
            recordLink: {
              target_app: 'cd17:health',
              path: '/#/networks/healthy/134265794',
              query_params: {
                aaid: '134265794',
              }
            }
          },
          applianceStatus: {
            value: 100,
            cssName: 'highlight acceptable percentage',
            recordLink: {
              target_app: 'cd17:health',
              path: '/#/appliances/healthy/134265794',
              query_params: {
                aaid: '134265794'
              }
            }
          },
          agentStatus: {
            value: 100,
            cssName: 'highlight acceptable percentage',
            recordLink: {
              target_app: 'cd17:health',
              path: '/#/agents/healthy/134265794',
              query_params: {
                aaid: '134265794'
              }
            }
          },
          missingAgents: {
            value: 1,
            cssName: 'highlight medium',
            recordLink: {
              target_app: 'cd17:health',
              path: '/#/hosts/unhealthy/134265794',
              query_params: {
                aaid: '134265794'
              }
            }
          },
          assetsScanned: {
            value: 50,
            cssName: 'highlight high percentage'
          },
          remediations: {
            value: 3,
            recordLink: {
              target_app: "cd17:health",
              path: '/#/remediations/unhealthy/134265794',
              query_params: {
                aaid: '134265794'
              }
            }
          },
          avgRemediationAge:  {
            value: 45,
            cssName: 'highlight high'
          }
        }],
        sortable: true,
        defaultSortField: 'account',
        defaultSortOrder: 1
      } as TableListConfig);
    });
  });
  describe('with zero counts for all of the fields', () => {
    it('should return a correcly constructed TableListConfig object containing zero value cell contents', () => {
      const response = {
          rows: [[
            134265794,
            'AWS TOS',
            {
              network_status: 0,
              missing_agent: 0,
              endpoint_protection: 0,
              configuration_remediation: 0,
              asset_scanned: 0,
              appliance_status: 0,
              agent_status: 0
            },
            {
              network_status: {
                Unhealthy: 0,
                Healthy: 0
              },
              missing_agent: {
                Missing: 0
              },
              endpoint_protection: {
                protected: 0
              },
              configuration_remediation: {
                Remediations: 0
              },
              asset_scanned: {
                Unscanned: 0,
                Scanned: 0
              },
              appliance_status: {
                Unhealthy: 0,
                Healthy: 0
              },
              agent_status: {
                Unhealthy: 0,
                Healthy: 0
              }
            }
          ]]
      };
      expect(healthStatusScorecard(response)).toEqual({
        headers: [
          {name: 'Account', field: 'account', class: 'align-left'},
          {name: 'Protected Network Status', field: 'networkProtection', class: 'align-center'},
          {name: 'Appliance Collection Status', field: 'applianceStatus', class: 'align-center'},
          {name: 'Agent Collection Status', field: 'agentStatus', class: 'align-center'},
          {name: 'Unhealthy Hosts with No Agent', field: 'missingAgents', class: 'align-center'},
          {name: 'Configuration Remediations', field: 'remediations', class: 'align-center'},
          {name: 'Assets Scanned %', field: 'assetsScanned', class: 'align-center'},
          {name: 'Average Remediation Age', field: 'avgRemediationAge', class: 'align-center'},
        ],
        body: [{
          account: 'AWS TOS (134265794)',
          networkProtection: {
            value: 'None',
            cssName: 'highlight low'
          },
          applianceStatus: {
            value: 'None',
            cssName: 'highlight low'
          },
          agentStatus: {
            value: 'None',
            cssName: 'highlight low'
          },
          missingAgents: {
            value: 'None',
            cssName: 'highlight low'
          },
          assetsScanned: {
            value: 'None',
            cssName: 'highlight low'
          },
          remediations: {
            value: 'None',
            cssName: 'highlight low'
          },
          avgRemediationAge:  {
            value: 'N\\A',
            cssName: 'highlight low'
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
      expect(healthStatusScorecard(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero,
      } as ZeroState);
    });
  });
});
