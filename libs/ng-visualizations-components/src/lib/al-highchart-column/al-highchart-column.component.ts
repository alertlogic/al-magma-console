/**
 * @author Megan Castleton <megan.castleton@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2019
 */
import { Input, Component, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { SeriesClickEventObject } from 'highcharts';
import { AlHighChartsUtilityService } from '../services/al-highcharts-utility-service';
// tslint:disable-next-line:no-duplicate-imports
import * as Highcharts from 'highcharts';


@Component({
    selector: 'al-highchart-column',
    templateUrl: './al-highchart-column.component.html',
    styleUrls: ['./al-highchart-column.component.scss']
})
export class AlHighchartColumnComponent implements OnChanges {
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
        const seriesCount: number = this.config.series.length;
        const exclusiveSeries: boolean = config.exclusiveSeries || false;

        // Initial only make the first series visible if an exclusive series view is to be used
        // Also override any name passed in to a CTA
        if (exclusiveSeries) {
          config.series = service.setMutualSeries(config.series, config.seriesDescriptions);
        }

        columnChart = Highcharts.chart(this.chart.nativeElement, {
            chart: {
                type: 'column',
                styledMode: true,
                inverted: this.config.inverted ? this.config.inverted : false
            },
            credits: {
                enabled: false
            },
            title: {
                text: this.config.title
            },
            tooltip: {
              useHTML: true,
              shadow: false
            },
            xAxis: {
                categories: this.config.dateOptions,
            },
            yAxis: {
                gridLineColor: 'transparent',
                title: {
                    text: exclusiveSeries ? config.seriesDescriptions[0] : config.description
                },
                allowDecimals: false,
                type: this.config.yAxisType || 'logarithmic',
                tickInterval: this.config.yAxisType && this.config.yAxisType === 'linear' ?  undefined: 1,
                minorTickInterval: 1,
                lineWidth: 0,
                gridLineWidth: 0,
                minorGridLineWidth: 0,
                labels: {
                    format: this.config.stacking === 'percent' ? '{value}%' : null
                },
                showFirstLabel: false
            },
            plotOptions: {
                column: {
                    stacking: this.config.stacking || 'normal',
                    tooltip: {
                      pointFormatter: function () {
                        return service.tooltipPointFormatter(seriesCount, this, exclusiveSeries, config.tooltipString || null);
                      },

                      headerFormat: ''
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
                },
                line: {
                    tooltip: {
                        pointFormat: `
                            <span class="detail">{point.category}</span><br>
                            <span class="description">{series.name}:</span> <span class="detail">{point.y}%</span><br>
                        `,
                    }
                }
            },
            series: this.config.series
        });
    }

    private updateSeries = (): void => {
        this.columnChart.update({
            series: this.config.series,
            xAxis: {
              categories: this.config.dateOptions
          }
        });
    }
}
