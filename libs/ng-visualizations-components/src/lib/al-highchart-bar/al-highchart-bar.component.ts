/**
 * @author Megan Castleton <megan.castleton@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2019
 */
import { Input, Component, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { AlHighChartsUtilityService } from '../services/al-highcharts-utility-service';
import * as Highcharts from 'highcharts';

@Component({
    selector: 'al-highchart-bar',
    templateUrl: './al-highchart-bar.component.html',
    styleUrls: ['./al-highchart-bar.component.scss']
})
export class AlHighchartBarComponent implements OnChanges {
    @ViewChild('barChart', {static:true}) chart: ElementRef;

    public barChart: any;
    /**
     * Input to populate the graph - set to 'any' until backend is defined, allowing us to build
     * an interface
     */
    @Input() config: any;

    /*
     *
     */
    constructor(private utilityService: AlHighChartsUtilityService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.config) {
            if (changes.config.previousValue === undefined && changes.config.currentValue !== undefined) {
              this.populateConfig();
            } else {
              this.updateSeries();
            }
        }
    }

    private populateConfig = (): void => {
        const service = this.utilityService;
        this.barChart = Highcharts.chart(this.chart.nativeElement, {
            chart: {
                type: 'bar',
                styledMode: true
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: this.config.categories
            },
            yAxis: {
                min: 0,
                title: {
                    text: this.config.title
                }
            },
            legend: {
                reversed: true
            },
            plotOptions: {
              series: {
                stacking: 'normal',
                events: {
                  // tslint:disable-next-line
                  legendItemClick: function(e: Highcharts.SeriesLegendItemClickEventObject) {
                    service.seriesLegendClickHandler(e);
                  },
                  // tslint:disable-next-line
                  click: function(event) {
                    event.target.dispatchEvent(new CustomEvent('data-element-clicked', {
                      detail: {
                        segment: event.point
                      },
                      bubbles: true
                    }));
                  }
                }
              }
            },
            series: this.config.series
        });
    }

    private updateSeries = (): void => {
        this.barChart.update({
            series: this.config.series
        });
    }
}
