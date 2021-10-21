import { Widget as WidgetConfig, TableListConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';
import { getTotalForKeys, highlightSeverity, highlightValue, highlightRiskLevel } from '../transformation.utilities';

enum Column {
  AccountId,
  AccountName,
  AvgDays,
  Counts
}

interface OverallCounts {
  network_status: number;
  missing_agent: number;
  configuration_remediation: number;
  appliance_status: number;
  agent_status: number;
}

interface CountBreakdowns {
  network_status: {
    Unhealthy?: number;
    Healthy?: number;
  };
  missing_agent: {
    Missing: number;
  };
  endpoint_protection: {
    protected: 0;
  };
  configuration_remediation: {
    Remediations: number;
  };
  appliance_status: {
    Unhealthy?: number;
    Healthy?: number;
  };
  agent_status: {
    Unhealthy?: number;
    Healthy?: number;
  };
  asset_scanned: {
    Unscanned: number,
    Scanned: number;
  };
}

export const healthStatusScorecard = (response: {rows: any[];}, item?: WidgetConfig): TableListConfig | ZeroState => {
  const rows = response.rows;
  if (rows.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const noValueCellContent = {
    value: 'None',
    cssName: 'highlight low'
  };
  const notApplicableCellContent = {
    value: 'N\\A',
    cssName: 'highlight low'
  };

  return {
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
    body: rows.map(row => {
      const overallCounts: OverallCounts = row[Column.AvgDays];
      const countBreakdowns: CountBreakdowns = row[Column.Counts];
      const totalAppliances = getTotalForKeys(countBreakdowns.appliance_status);
      const overallHealthyAppliances = (countBreakdowns.appliance_status.Healthy / totalAppliances) * 100;
      const totalAgents = getTotalForKeys(countBreakdowns.agent_status);
      const overallHealthyAgents = (countBreakdowns.agent_status.Healthy / totalAgents) * 100;
      const totalNetworks = getTotalForKeys(countBreakdowns.network_status);
      const overallHealthyNetworks = (countBreakdowns.network_status.Healthy / totalNetworks) * 100;
      const missingAgents = countBreakdowns.missing_agent.Missing;
      const endpointProtection = countBreakdowns.endpoint_protection.protected;
      const totalAssets = getTotalForKeys(countBreakdowns.asset_scanned);
      const overallAssetsScanned = (countBreakdowns.asset_scanned.Scanned / totalAssets) * 100;
      const openConfigRemediations = countBreakdowns.configuration_remediation.Remediations;
      const avgRemediationAge = overallCounts.configuration_remediation;
      const accountId = row[Column.AccountId];
      return {
        account: `${row[Column.AccountName]} (${accountId})`,
        networkProtection: totalNetworks > 0 ? {
          value: Math.round(overallHealthyNetworks),
          cssName: `${highlightValue(overallHealthyNetworks, {high: 0, medium: 67, acceptable: 90}, true)} percentage`,
          recordLink: {
            target_app: 'cd17:health',
            path: `/#/networks/healthy/${accountId}`,
            query_params: {
              aaid: `${accountId}`,
            }
          }
        } : noValueCellContent,
        applianceStatus: totalAppliances > 0 ? {
          value: Math.round(overallHealthyAppliances),
          cssName: `${highlightValue(overallHealthyAppliances, {high: 0, medium: 67, acceptable: 90}, true)} percentage`,
          recordLink: {
            target_app: 'cd17:health',
            path: `/#/appliances/healthy/${accountId}`,
            query_params: {
              aaid: `${accountId}`
            }
          }
        } : noValueCellContent,
        agentStatus: totalAgents > 0 ? {
          value: Math.round(overallHealthyAgents),
          cssName: `${highlightValue(overallHealthyAgents, {high: 0, medium: 67, acceptable: 90}, true)} percentage`,
          recordLink: {
            target_app: 'cd17:health',
            path: `/#/agents/healthy/${accountId}`,
            query_params: {
              aaid: `${accountId}`
            }
          }
        } : noValueCellContent,
        missingAgents: missingAgents > 0 ? {
          value: missingAgents,
          cssName: highlightValue(missingAgents, {high: 10, medium: 1}),
          recordLink: {
            target_app: 'cd17:health',
            path: `/#/hosts/unhealthy/${accountId}`,
            query_params: {
              aaid: `${accountId}`
            }
          }
        } : noValueCellContent,
        assetsScanned: totalAssets > 0 ? {
          value: Math.round(overallAssetsScanned),
          cssName: `${highlightValue(overallAssetsScanned, {high: 0, medium: 67, acceptable: 90}, true)} percentage`
        } : noValueCellContent,
        remediations: openConfigRemediations > 0 ? {
          value: openConfigRemediations,
          recordLink: {
            target_app: "cd17:health",
            path: `/#/remediations/unhealthy/${accountId}`,
            query_params: {
              aaid: `${accountId}`
            }
          }
        } : noValueCellContent,
        avgRemediationAge: avgRemediationAge > 0 ? {
          value: avgRemediationAge,
          cssName: highlightValue(avgRemediationAge, {high: 31, medium: 15})
        } : notApplicableCellContent
      };
    }),
    sortable: true,
    defaultSortField: 'account',
    defaultSortOrder: 1
  };
};
