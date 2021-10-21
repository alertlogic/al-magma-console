import { ZeroStateReason } from '@al/ng-visualizations-components';

/**
 * Returns true if all the 'data' elements are 'null'
 * @param data - row data
 */
const isEmpty = (data: number[]): boolean => {
  return data.every(element => element === null);
};

/**
 * eventActions transformation
 * kalm: dashboards_fim_event_actions
 * @param response - Raw data from API
 */
export const eventActions = (response: { rows: number[][], column_info: { type: string, name: string }[] }) => {
  const colors: string[] = ['al-green-500', 'al-orange-500', 'active-mac'];
  const events: string[] = ['Create', 'Modify', 'Delete'];
  const rows = response.rows;

  if (isEmpty(rows[0])) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  const seriesData = events.map((item, index) => {
    return {
      name: item,
      value: item,
      className: colors[index % 3],
      recordLink: {},
      y: rows[0][index]
    };
  }).filter(item => item.y > 0);

  return {
    series: [{
      data: seriesData
    }]
  };
};
