import { ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderExecutionsHistoryResult } from '@al/responder';
import { BaseColumnConfig } from '../base_objects.transformation';
import { getLocalShortDate } from '../transformation.utilities';
import { calculateExecutionPercentaje, getExecutionDates, getExecutionSeriesPlaybook } from './execution.utilities';

export const playbookExecutionTrends = (response: AlResponderExecutionsHistoryResult) => {

  if (response.aggregations.playbook_names.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  const playbooksAggregation = response.aggregations.playbook_names;
  const playbooksIdsAggregation = response.aggregations.playbook_ids;
  const datesDictionary: { [key: string]: number } = getExecutionDates(playbooksAggregation);
  const datesSorted: string[] = Object.keys(datesDictionary).sort();

  const series = getExecutionSeriesPlaybook(
    datesDictionary,
    datesSorted,
    playbooksAggregation,
    playbooksIdsAggregation);
  calculateExecutionPercentaje(datesDictionary, datesSorted, series);
  const datesLabel = datesSorted.map(item => {
    const dateParsed = new Date(parseInt(item, 10) * 1000);
    return getLocalShortDate(dateParsed);
  });
  const config: BaseColumnConfig = {
    title: '',
    description: '',
    yAxisType: 'linear',
    dateOptions: datesLabel,
    series: series
  };

  return JSON.parse(JSON.stringify(config));
};
