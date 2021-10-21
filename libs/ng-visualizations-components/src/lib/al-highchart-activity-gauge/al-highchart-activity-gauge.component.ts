/*
 * Highcharts Activity Gauge Component
 *
 * @author stephen.jones <stephen.jones@alertlogic.com>
 * @copyright Alert Logic 2019
 *
 */
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AlHighchartsActivityGaugeService } from './al-highchart-activity-gauge.service';
import * as Highcharts from 'highcharts/highcharts';
// tslint:disable-next-line: import-name
import HighchartsMore from 'highcharts/highcharts-more';
// tslint:disable-next-line: import-name
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import { ActivityGaugeConfig } from '../types';


@Component({
    selector: 'al-highchart-activity-gauge',
    templateUrl: './al-highchart-activity-gauge.component.html',
    styleUrls: ['./al-highchart-activity-gauge.component.scss']
})

export class AlHighchartsActivityGaugeComponent implements OnInit {

    /*
     * Variables
     */
    public chart: Highcharts.Chart;

    /*
     *  Elements
     */
    @ViewChild('chartTarget', {static:true}) chartTarget: ElementRef;

    /*
     *  Inputs
     */
    @Input() config: ActivityGaugeConfig;

    /*
     *  Outputs
     */

    constructor(
        private gaugeService: AlHighchartsActivityGaugeService
    ) {
      HighchartsMore(Highcharts);
      HighchartsSolidGauge(Highcharts);
    }

    /*
     *
     */
    ngOnInit() {
      this.chart = Highcharts.chart(this.chartTarget.nativeElement, this.gaugeService.getConfig(this.config));
    }
}

