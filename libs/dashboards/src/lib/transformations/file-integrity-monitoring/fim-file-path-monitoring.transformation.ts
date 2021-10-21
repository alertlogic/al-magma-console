import { ZeroStateReason } from '@al/ng-visualizations-components';
import { baseSemiCircleObject } from '../base_objects.transformation';
import { AlFimConfigurationSummaryReport, AlFimConfigurationReportTypes } from '@al/fim';

/**
 * filePathMonitoringStatus transformation
 * fim: getConfigurationsSummary
 * @param response - Raw data from API
 */
export const filePathMonitoringStatus = (response: AlFimConfigurationSummaryReport) => {
  const config = Object.assign({}, baseSemiCircleObject);
  const monitoredPaths: AlFimConfigurationReportTypes = response.monitored_paths;
  const excludedPaths: AlFimConfigurationReportTypes = response.excluded_paths;

  const reducer = (accumulator: number, currentValue: number): number => accumulator + currentValue;
  const monitoredPathsTotal: number = Object.keys(monitoredPaths).map(item => monitoredPaths[item].num_enabled).reduce(reducer);
  const excludedPathsTotal: number = Object.keys(excludedPaths).map(item => excludedPaths[item].num_enabled).reduce(reducer);

  if (monitoredPathsTotal + excludedPathsTotal === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  Object.assign(config.series[0], {
    data: [{
      name: 'Monitored Paths',
      y: monitoredPathsTotal,
      className: 'healthy'
    }, {
      name: 'Excluded Paths',
      y: excludedPathsTotal,
      className: 'unhealthy'
    }]
  });
  return JSON.parse(JSON.stringify(config));
};
