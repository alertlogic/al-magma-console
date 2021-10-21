import { ZeroStateReason } from '@al/ng-visualizations-components';
import { AlFimClient } from '@al/fim';
import { Deployment } from '@al/deployments';

export interface DeploymentMonitoredData {
  deploymentName: string;
  deploymentId: string;
  platformType: string;
  total: number;
}

/**
 * deploymentMonitoredStatus transformation
 * @param response - Raw data from API
 */
export const deploymentMonitoredStatus = async (response: Deployment[]) => {
  if (response.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  const data: DeploymentMonitoredData[] = await Promise.all(response.map(async (deployment): Promise<DeploymentMonitoredData> => {
    const total: number = (await AlFimClient.getAllConfigurations('monitored_paths', deployment.account_id, deployment.id)).filter(item=>item.enabled).length;
    return { total, deploymentName: deployment.name, deploymentId: deployment.id, platformType: deployment.platform.type };
  }));

  return {
    headers: [
      { name: 'Deployment', field: 'deployment', class: 'left' },
      { name: 'Total File Paths', field: 'total', class: 'right' },
    ],
    body: data.map((item) => ({
      deployment: item.deploymentName,
      total: item.total,
      recordLink: {
        target_app: `cd17:config`,
        path: `/#/deployments-adr/${item.platformType}/:accountId/${item.deploymentId}`,
        query_params: {
          step: 'fim_monitoring'
        }
      },
    })).sort((a, b) => b.total - a.total)// Sort by total desc
  };
};
