import { ZeroStateReason } from '@al/ng-visualizations-components';
import { AlFimConfigurationSummaryReport, AlFimConfigurationReportTypes } from '@al/fim';

const typesNames = {
  win_reg: 'Windows Registry',
  win_dir: 'Windows',
  nix_dir: 'Linux'
};

/**
 * monitoredFileTypes transformation
 * fim: getConfigurationsSummary
 * @param response - Raw data from API
 */
export const monitoredFileTypes = (response: AlFimConfigurationSummaryReport): any => {
  const reducer = (accumulator: number, currentValue:number): number => accumulator + currentValue;
  const monitoredPaths: AlFimConfigurationReportTypes = response.monitored_paths;
  const count: number = Object.keys(monitoredPaths).map(item => monitoredPaths[item].num_enabled).reduce(reducer);
  let labels: string[] = [];
  if (count === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  } else {
    const keys = Object.keys(monitoredPaths );
    const seriesData = keys.map((item) => {
      return {
        name: item,
        value: monitoredPaths[item].num_enabled,
        className: `al-blue-500`,
        y: monitoredPaths[item].num_enabled,
        percent: `${Math.round((monitoredPaths[item].num_enabled / count)  * 100)}%`
      };
    });
    seriesData.sort((a,b) =>  b.value - a.value);
    labels = seriesData.map((series) => {
      return typesNames[series.name];
    });
    return {
      dateOptions: labels,
      series: [{
        data: seriesData,
        showInLegend: false
      }]
    };
  }
};
