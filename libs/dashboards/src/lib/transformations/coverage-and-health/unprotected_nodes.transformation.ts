import { Widget as WidgetConfig } from '@al/ng-visualizations-components';
/*
 *
 */
export const unprotectedNodes = (response: any, item?: WidgetConfig) => {
  return {
    primaryCount: response.assets[0][0]
  };
};
