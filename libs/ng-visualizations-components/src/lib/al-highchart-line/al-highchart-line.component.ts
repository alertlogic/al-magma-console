/**
 * @author Robert Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2019
 */
import { Input, Component, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { SeriesClickEventObject } from 'highcharts';
import { AlHighChartsUtilityService } from '../services/al-highcharts-utility-service';
// tslint:disable-next-line:no-duplicate-imports
import * as Highcharts from 'highcharts';


@Component({
    selector: 'al-highchart-line',
    templateUrl: './al-highchart-line.component.html',
    styleUrls: ['./al-highchart-line.component.scss']
})
export class AlHighchartLineComponent implements OnChanges {
    @ViewChild('chart', {static:true}) chart: ElementRef;

    public columnChart: any;
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
        this.utilityService.addClickClass(this.config.series);
        if (changes.config.previousValue === undefined && changes.config.currentValue !== undefined) {
          this.populateConfig();
        } else {
          this.updateSeries();
        }
      }
    }

    private populateConfig = (): void => {
        let columnChart: any = this.columnChart;
        const config = this.config;
        const service = this.utilityService;
        const seriesCount: number = config.series.length;
        const exclusiveSeries: boolean = config.exclusiveSeries || false;

        // Initial only make the first series visible if an exclusive series view is to be used
        // Also override any name passed in to a CTA
        if (exclusiveSeries) {
          config.series = service.setMutualSeries(config.series, config.seriesDescriptions);
        }
        // Set up the chart
        columnChart = Highcharts.chart(this.chart.nativeElement, {
            chart: {
                type: 'line',
                styledMode: true
            },
            credits: {
                enabled: false
            },
            title: {
                text: config.title
            },
            tooltip: {
                headerFormat: '',
                shadow: false,
                useHTML: true,
                pointFormatter: function () {
                  return service.tooltipPointFormatter(seriesCount, this, exclusiveSeries, config.tooltipString || null);
                }
            },
            xAxis: {
                categories: config.dateOptions,
            },
            yAxis: {
                gridLineColor: 'transparent',
                title: {
                    text: exclusiveSeries ? config.seriesDescriptions[0] : config.description
                },
                type: config.yAxisType || 'logarithmic',
                tickInterval: config.yAxisType && config.yAxisType === 'linear' ?  undefined: 1,
                minorTickInterval: 1,
                lineWidth: 0,
                gridLineWidth: 0,
                minorGridLineWidth: 0,
                showFirstLabel: false,
                allowDecimals: false
            },
            plotOptions: {
                line: {
                  marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2
                  }
                },
                series: {
                    events: {
                      legendItemClick: function (e: any) {
                        if (exclusiveSeries) {
                          columnChart.update({
                            yAxis: {
                              title: {
                                text: config.seriesDescriptions[e.target.index]
                              }
                            }
                          });
                          service.seriesMutualClickHandler(e);
                        } else {
                          service.seriesLegendClickHandler(e);
                        }
                      },
                      click: function (event: SeriesClickEventObject) {
                        service.dataElementClick(event);
                      }
                    }
                }
            },
            series: config.series
        });
    }

    private updateSeries = (): void => {
        this.columnChart.update({
            series: this.config.series
        });
    }
}
