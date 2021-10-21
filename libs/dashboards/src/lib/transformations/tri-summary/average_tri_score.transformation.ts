import { Widget as WidgetConfig } from '@al/ng-visualizations-components';

export const averageTriScore = (response: {rows: any[];}, item?: WidgetConfig) => {

  return {
    primaryCount: response.rows[0] ? response.rows[0][0] : 0
  };

};
