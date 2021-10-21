import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';

/*
 *
 */
export const incidentCountCreated = (response: any, item?: WidgetConfig): any => {
  const data = JSON.parse(JSON.stringify(response.aggregations.createtime_str.date_period['incident.threatRating']));
  const reducer = (accumulator, currentValue) => accumulator + currentValue;

  if (response.total === 0 || Object.keys(data).length === 0) {
    return {
      primaryCount: 0
    };
  } else {
    return {
      primaryCount: Object.values(data).reduce(reducer) as number
    };
  }
};
