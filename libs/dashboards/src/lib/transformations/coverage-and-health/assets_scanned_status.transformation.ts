import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';

import { baseSemiCircleObject } from '../base_objects.transformation';

export const assetsScanned = (responses: any[], item?: WidgetConfig) => {
  const totalAssets = responses[0].assets[0][0];
  const assetCountScanned = responses[1].assets[0][0];
  const assetCountNotScanned = totalAssets - assetCountScanned;
  const config = Object.assign({}, baseSemiCircleObject);
  if ( assetCountScanned + assetCountNotScanned === 0 ) {
    return {
       nodata: true,
       reason: ZeroStateReason.Zero
     };
  } else {
    Object.assign(config.series[0], {data: [{
        name: 'Scanned',
        y: assetCountScanned,
        className: 'scanned'
      }, {
        name: 'Not Scanned',
        y: assetCountNotScanned,
        className: 'not-scanned'
    }]});
    return JSON.parse(JSON.stringify(config));
  }
};
