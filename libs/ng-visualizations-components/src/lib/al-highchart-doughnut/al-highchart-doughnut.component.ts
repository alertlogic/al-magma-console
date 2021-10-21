/**
 * @author Megan Castleton <megan.castleton@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2019
 */
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts';
// tslint:disable-next-line:no-duplicate-imports
import { SeriesClickEventObject, SeriesOptionsType } from 'highcharts';
import { AlHighChartsUtilityService } from '../services/al-highcharts-utility-service';

@Component({
    selector: 'al-highchart-doughnut',
    templateUrl: './al-highchart-doughnut.component.html',
    styleUrls: ['./al-highchart-doughnut.component.scss']
})
export class AlHighchartDoughnutComponent implements OnChanges  {
    @ViewChild('chart', {static:true}) chart: ElementRef;

    public doughnutChart: Highcharts.Chart;
    /**
     * Input to populate the graph - set to 'any' until backend is defined, allowing us to build
     * an interface
     */
    @Input() config: {series:Highcharts.SeriesOptions[]}|undefined;


    /*
     *
     */
    constructor(private utilityService: AlHighChartsUtilityService) { }

    ngOnChanges(changes: SimpleChanges): void {
      if (this.config) {
        this.utilityService.addClickClass(this.config.series);
        if (changes.config.previousValue === undefined && changes.config.currentValue !== undefined) {
          this.populateConfig();
        } else {
          this.updateSeries();
        }
      }
    }

    private populateConfig = (): void => {
        const service = this.utilityService;
        const legend: Highcharts.LegendOptions = this.legendConfig();
        const seriesCount: number = this.config.series.length;

        this.doughnutChart = Highcharts.chart(this.chart.nativeElement, {
            legend,
            chart: {
                type: 'pie',
                styledMode: true
            },
            plotOptions: {
                pie: {
                    shadow: false,
                    center: ['50%', '50%'],
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false,
                    },
                    point: {
                      events: {
                        legendItemClick: function (e: Highcharts.PointLegendItemClickEventObject) {
                          service.pieLegendClickHandler(e);
                        }
                      }
                    },
                    events: {
                        click: function (event: SeriesClickEventObject) {
                          service.dataElementClick(event);
                        }
                    }
                }

            },
            title: {
                text: ''
            },
            tooltip: {
                headerFormat: '',
                shadow: false,
                shape: 'callout',
                useHTML: true,
                pointFormatter: function () {
                  return service.tooltipPointFormatter(seriesCount, this);
                }
            },
            credits: {
                enabled: false
            },
            series: this.prepareSeries(this.config.series)
        }, chart => {
          chart.legend.update(this.legendConfig());
        });
    }

    /*
     * When the point count gets above 4 change the legend so that it shows in two
     * vertical columns
     */
    private legendConfig (): Highcharts.LegendOptions {
      const totalItems = (this.config.series[0] as any).length || (this.config.series[0] as any).data.length;
      if (totalItems > 3) {
        const width: number = this.chart.nativeElement.offsetWidth - 20;
        const itemWidth: number = width / 2;
        const itemStyleWidth: number = itemWidth - 15;

        return {
          width,
          itemWidth,
          labelFormat: '{name}',
          itemStyle: {
            width: itemStyleWidth
          }
        };
      } else {
        return {
          labelFormat: '{name}',
          layout: 'horizontal'
        };
      }
    }

    /*
     *
     */
    private updateSeries = (): void => {
      const legend: Highcharts.LegendOptions = this.legendConfig();
      this.doughnutChart.update({
        legend,
        series: this.prepareSeries(this.config.series)
      });
    }

    private prepareSeries(seriesConfig: Highcharts.SeriesOptions[]): SeriesOptionsType[] {
      const series:SeriesOptionsType[] = [];
      if(seriesConfig.length === 1) {
        series.push({
          type: 'pie',
          size: '90%',
          innerSize: '55%',
          data: (seriesConfig[0] as any).data,
          showInLegend: true
        });
      } else {
        seriesConfig.forEach((conf, i) => {
          series.push(this.buildSeries(conf, i));
        });
      }
      return series;
    }

    private buildSeries(config:Highcharts.SeriesOptions, index:number):SeriesOptionsType {
      return {
          type: 'pie',
          size: index === 0 ? '60%' : '90%',
          innerSize: index === 0 ? '55%' : '60%',
          data: (config as any).data,
          showInLegend: config.hasOwnProperty('showInLegend') ? (config as any).showInLegend : true
      };
    }
}
