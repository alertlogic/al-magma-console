import { Injectable } from '@angular/core';
import { ActivityGaugeConfig, ActivityGaugeValueFormat } from '../types';
import { BASE_CONFIG } from './al-highchart-activity-gauge.types';
import { numberContract } from '../formatters';
import * as Highcharts from 'highcharts/highcharts';

@Injectable({
    providedIn: 'root'
})

export class AlHighchartsActivityGaugeService {

  /*
   *
   */
  getConfig(config: ActivityGaugeConfig): any {
    const { value, maxValue, valueFormat, bodyText, footerText, gaugeClass, gaugeBackgroundClass, contractValues, overrunClass, tooltip } = config;

    // Gauges run from 0 - 100, i.e. a percentage. Therefore derive the value percentage
    // from the value and max values
    const gaugeValue = value === 0 ? 0 : (value / maxValue) * 100;

    BASE_CONFIG.series[0].data[0].y = gaugeValue;
    BASE_CONFIG.series[0].data[0].className = gaugeClass || '';
    BASE_CONFIG.pane.background[0].className = gaugeBackgroundClass || gaugeClass || '';

    // Format the center text which contains a value and optional body text
    // If an overrun class has been used to signify the value being greater than
    // the max value then apply it
    BASE_CONFIG.plotOptions.solidgauge.dataLabels.formatter = (() => {
      const contractedValue = numberContract(value);
      const contractedMaxValue = numberContract(maxValue);
      const dislayValue = contractValues ? `${contractedValue.count}${contractedValue.suffix}` : value;
      const dislayMaxValue = contractValues ? `${contractedMaxValue.count}${contractedMaxValue.suffix}` : maxValue;
      let gaugeValueString: string = "0";

      switch (valueFormat) {
        case ActivityGaugeValueFormat.Split:
          gaugeValueString = `${dislayValue} / ${dislayMaxValue}`;
          break;

        case ActivityGaugeValueFormat.Percentage:
          gaugeValueString = `${((value / maxValue) * 100).toFixed(1)}%`;
          break;

        case ActivityGaugeValueFormat.ValueOnly:
          gaugeValueString = `${dislayValue}`;
          break;
      }

      return `
        <dl style='display: flex; flex-direction: column; align-items: center; font-family: "Open Sans"; font-weight: 100; margin-left: -5px'>
          <dt style='font-size: 24px' class="${overrunClass && (value > maxValue) ? overrunClass + ' color' : ''}">${gaugeValueString}</dt>
          <dd style="margin: 0; font-size: 12px">${bodyText || ''}</dd>
      </dl>`;
    });

    // Default tooltip or use a passed in tooltip
    BASE_CONFIG.tooltip.pointFormat = tooltip ? tooltip : `
      <span class="description">${value} of ${maxValue}</span><br>
      <span class="description">${gaugeValue.toFixed(1)}%</span>
    `;

    // Optional footer text
    if ( footerText ) {
      Object.assign(BASE_CONFIG.chart, {
        margin: [0, 0, 25, 0],
        events: {
          load: function () {
            const label = this.renderer.label(footerText).css({width: '200px', "font-family": 'Open Sans'}).attr({padding: 5}).add();
            label.align(Highcharts.extend(label.getBBox(), {
              align: 'center',
              verticalAlign: 'bottom',
              y: 20
            }), null, 'spacingBox');
          }
        }
      });
    }

    return BASE_CONFIG;
  }
}
