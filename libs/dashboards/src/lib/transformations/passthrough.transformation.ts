import { Widget as WidgetConfig } from '@al/ng-visualizations-components';

/*
 * Transformation that passes through exactly what it receives - generally used for mocking
 */
export const passthrough = (response: any, item?: WidgetConfig) => {
    return response;
};
