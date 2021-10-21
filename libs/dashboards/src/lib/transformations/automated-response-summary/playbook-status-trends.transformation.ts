import { ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderExecutionsHistoryResult } from '@al/responder';
import { BaseColumnConfig } from '../base_objects.transformation';
import { getLocalShortDate } from '../transformation.utilities';
import { calculateExecutionPercentaje, generateExecutionSeriesByItem, getExecutionDates } from './execution.utilities';

export const playbookStatusTrends = (response: AlResponderExecutionsHistoryResult) => {

  if (response.aggregations.statuses.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  const series = [{
    name: 'Succeeded',
    data: [],
    className: 'al-green-500',
    showInLegend: false,
    type: 'area'
  }, {
    name: 'Failed',
    data: [],
    className: 'al-red-500',
    showInLegend: false,
    type: 'area'
  }];

  const statusAggregationSucceeded = response.aggregations.statuses.find(status => {
    return Object.keys(status)[0] === 'succeeded';
  });
  const statusAggregationFailed = response.aggregations.statuses.find(status => {
    return Object.keys(status)[0] === 'failed';
  });

  const statusAggregation = [];
  if(statusAggregationSucceeded){
    statusAggregation.push(statusAggregationSucceeded );
  }
  if(statusAggregationFailed){
    statusAggregation.push(statusAggregationFailed );
  }
  const datesDictionary: { [key: string]: number } = getExecutionDates(statusAggregation);
  const datesSorted: string[] = Object.keys(datesDictionary).sort();

  if (statusAggregationSucceeded) {
    series[0].data = generateExecutionSeriesByItem(datesDictionary, datesSorted, statusAggregationSucceeded['succeeded'], null);
  }

  if (statusAggregationFailed) {
    series[1].data = generateExecutionSeriesByItem(datesDictionary, datesSorted, statusAggregationFailed['failed'], null);
  }

  calculateExecutionPercentaje(datesDictionary, datesSorted, series);
  const datesLabel = datesSorted.map(item => {
    const dateParsed = new Date(parseInt(item, 10) * 1000);
    return getLocalShortDate(dateParsed);
  });

  const config: BaseColumnConfig = {
    title: '',
    yAxisType: 'linear',
    description: 'Playbook Execution Status Trends',
    dateOptions: datesLabel,
    series: series,
    chartHeight: 350
  };

  return config;
};
