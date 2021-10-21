import { ZeroStateReason } from '@al/ng-visualizations-components';
import { AlTriggerTrends } from '@al/gestalt';
import { BaseColumnConfig } from '../base_objects.transformation';
import { getLocalShortDate } from '../transformation.utilities';
import { calculateExecutionPercentaje, getExecutionDates, getExecutionSeriesPlaybook, getExecutionSeriesTriggers } from './execution.utilities';

export const playbookTriggerTrends = (response: AlTriggerTrends) => {

  if (response.aggregations.trigger_ids.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  const triggerIdsAggregation = response.aggregations.trigger_ids;
  const datesDictionary: { [key: string]: number } = getExecutionDates(triggerIdsAggregation);
  const datesSorted: string[] = Object.keys(datesDictionary).sort();

  const series = getExecutionSeriesTriggers(
    datesDictionary,
    datesSorted,
    triggerIdsAggregation,
    response.triggers);
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
