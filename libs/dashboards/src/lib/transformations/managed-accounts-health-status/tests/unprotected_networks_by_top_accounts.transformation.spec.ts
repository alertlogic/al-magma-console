import { unprotectedNetworksByTopAccounts } from '../unprotected_networks_by_top_accounts.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Transformation Utilities Test Suite: UnProtected Networks By Top Accounts', () => {
  describe('when calling missingAgentsByTopAccounts', () => {
    it('should return a ZeroStateReason when there is no data', () => {
      const response = {rows: []};
      const expected = {
        nodata: true,
        reason: ZeroStateReason.Zero,
      };
      expect(unprotectedNetworksByTopAccounts(response)).toEqual(expected);
    });

    it('should return the correct object when a valid response is passed in', () => {
      const response = {rows: [
        [
          134241351,
          "SRE UI - Assess Only",
          { "vulnerability": 0, "tri": 0, "remediation": 0, "incident": 0 },
          { "vulnerability": { "Medium": 9, "Low": 1, "Info": 3, "High": 0 },
            "tri": { "Severity": 4, "Score": 61.5 },
            "remediation": { "Open": 7 },
            "network_status": { "Unhealthy": 7 },
            "incident": { "Info": 0, "High": 0, "Critical": 0 }
          }
        ],
        [
          134231947,
          "SRE UI - Detect Only",
          { "vulnerability": 1, "tri": 0, "remediation": 0, "incident": 0 },
          { "vulnerability": { "Medium": 9, "Low": 1, "Info": 3, "High": 0 },
            "tri": { "Severity": 2, "Score": 5.8 },
            "remediation": { "Open": 7 },
            "network_status": { "Unhealthy": 7 },
            "incident": { "Info": 0, "High": 0, "Critical": 0 }
          }
        ],
        [
          134234927,
          "SRE UI - Respond Only",
          { "vulnerability": 0, "tri": 0, "remediation": 0, "incident": 0 },
          { "vulnerability": { "Medium": 4, "Low": 0, "Info": 3, "High": 0 },
            "tri": { "Severity": 1, "Score": 2.8 },
            "remediation": { "Open": 7 },
            "network_status": { "Unhealthy": 7 },
            "incident": { "Info": 0, "High": 0, "Critical": 50 }
          }
        ]
      ]};

      const expected = {
        dateOptions: ['SRE UI - Assess Only', 'SRE UI - Detect Only', 'SRE UI - Respond Only'],
        description: "UnProtected Networks",
        inverted: true,
        yAxisType: 'linear',
        tooltipString: '{{name}}: {{value}} {{newline}} Total: 21 {{newline}} % of Total: {{%total[21]}}%',
        series: [{
          type: 'column',
          showInLegend: false,
          data: [
            { "y": 7, "recordLink": { "aaid": "134241351" }, "className": "al-blue-400" },
            { "y": 7, "recordLink": { "aaid": "134231947" }, "className": "al-blue-400" },
            { "y": 7, "recordLink": { "aaid": "134234927" }, "className": "al-blue-400" }
          ]
        }]
      };

      expect(unprotectedNetworksByTopAccounts(response)).toEqual(expected);
    });
  });
});


