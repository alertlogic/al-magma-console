import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';

/*
 *
 */
export const attackClassificationTypeWla = (response: any, item?: WidgetConfig): any => {
    const data = JSON.parse(JSON.stringify(response.aggregations.createtime_str.date_period));
    const count = data.count;

    if (count === 0) {
      return {
        nodata: true,
        reason: ZeroStateReason.Zero
      };
    } else {
      const incidentTypesClasses = data['incident.attackClassId_str'];
      const keys = Object.keys(incidentTypesClasses );
      const colors = ['200', '300', '400', '500', '600', '700', '800', '900'];

      // Build the config and filter out all 0 (zero) values
      const seriesData = keys.map((item, index) => {
        return {
          name: item,
          value: incidentTypesClasses[item],
          className: `al-blue-${colors[index % 8]}`,
          recordLink: {
            category: item,
            source: 'WLA',
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          },
          y: incidentTypesClasses[item],
          percent: `${Math.round((incidentTypesClasses[item] / count)  * 100)}%`
        };
      });
      seriesData.sort((a,b) =>  b.value - a.value);

      return {
        series: [{
          data: seriesData
        }]
      };
    }
};
