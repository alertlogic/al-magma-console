import { ZeroStateReason } from '@al/ng-visualizations-components';

/**
 * incidentCountCreatedByWla transformation
 * total incident count filtered by source = WLA
 * @param response - Raw data from API
 */
export const incidentCountCreatedByWla = (response: {[k:string]:any}): {[k:string]:number|boolean} => {
  const period = response.aggregations.createtime_str.date_period;
  const data = response.aggregations.createtime_str.date_period['incident.threatRating'];
  const count:number = period.count;

  if (count === 0 || Object.keys(data).length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  } else {
    return {
      primaryCount: count
    };
  }
};
