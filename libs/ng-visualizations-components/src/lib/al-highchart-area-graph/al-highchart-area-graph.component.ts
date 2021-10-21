/*
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
    selector: 'al-highchart-area-graph',
    templateUrl: './al-highchart-area-graph.component.html',
    styleUrls: ['./al-highchart-area-graph.component.scss']
})
export class AlHighchartAreaGraphComponent implements OnChanges {
    public areaGraphItem: Highcharts.Chart;

    @ViewChild('areaGraph', {static:true}) areaGraph: ElementRef;

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
      const service = this.utilityService;
      this.areaGraphItem = Highcharts.chart(this.areaGraph.nativeElement, Object.assign({
        chart: {
            type: 'area',
            styledMode: true
        },
        credits: {
            enabled: false
        },
        title: {
          text: ''
        },
        yAxis: {
            gridLineColor: 'transparent',
            type: this.config.yAxis.type || 'logarithmic',
            tickInterval: this.config.yAxis.type && this.config.yAxis.type === 'linear' ?  undefined: 1,
            minorTickInterval: 1,
            lineWidth: 0,
            gridLineWidth: 0,
            minorGridLineWidth: 0,
            showFirstLabel: false
        },
        tooltip: {
          headerFormat: '',
          shadow: false,
          useHTML: true,
          pointFormat: `
              <span class="detail">{point.category}</span><br>
              <span class="description">{series.name}:</span> <span class="detail">{point.y}</span><br>
              <span class="description">Total:</span> <span class="detail">{point.total}</span><br>
              <span class="description">% of Total:</span> <span class="detail">{point.percentage:.1f}%</span>
          `,
        },
        plotOptions: {
            series: {
              connectNulls: true
            },
            area: {
              stacking: 'normal',
              events: {
                legendItemClick: function (e: Highcharts.SeriesLegendItemClickEventObject) {
                  service.seriesLegendClickHandler(e);
                },
                click: function (event: SeriesClickEventObject) {
                  service.dataElementClick(event);
                }
              },
              marker: {
                  enabled: false,
                  symbol: 'circle',
                  radius: 2,
                  states: {
                      hover: {
                          enabled: true
                      }
                  }
              }
            }
        }
      }, this.config));
    }

    private updateSeries = (): void => {
        this.areaGraphItem.update({
            series: this.config.series
        });
    }
}
