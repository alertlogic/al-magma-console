/**
 * @author Robert Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 *
 * Based on https://www.highcharts.com/blog/snippets/synchronisation-of-multiple-charts/
 */
import { Input, Component, ViewChild, ElementRef, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { AlHighChartsUtilityService } from '../services/al-highcharts-utility-service';
import * as Highcharts from 'highcharts';
import { numberContract } from '../formatters';

@Component({
  selector: 'al-highchart-multi-trend',
  templateUrl: './al-highchart-multi-trend.component.html',
  styleUrls: ['./al-highchart-multi-trend.component.scss']
})
export class AlHighchartMultiTrendComponent implements OnChanges, OnInit {
  @ViewChild('chart', {static:true}) chart: ElementRef;

  public trendChart: Highcharts.Chart;

  @Input() config: any;

  private charts: Highcharts.Chart[] = [];

  constructor(private utilityService: AlHighChartsUtilityService) {
  }

  ngOnInit() {
    Highcharts.Pointer.prototype.reset = function () {
      return undefined;
    };

    /**
     * Highlight a point by showing tooltip, setting hover state and draw crosshair
     */
    (Highcharts.Point.prototype as any).highlight = function (event: Event) {
      event = this.series.chart.pointer.normalize(event);
      this.onMouseOver(); // Show the hover marker
      this.series.chart.tooltip.refresh(this); // Show the tooltip
      this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };
  }

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

  highlightPoints(e: PointerEvent|TouchEvent|MouseEvent) {
    let chart: Highcharts.Chart;
    let point: Highcharts.Point;
    let i;
    let event;

    for (i = 0; i < this.charts.length; i = i + 1) {
        chart = this.charts[i];
        event = chart.pointer.normalize(e); // Find coordinates within the chart
        point = (<any>chart.series[0]).searchPoint(event, true); // Get the hovered point

        if (point) {
            (point as any).highlight(e);
        }
    }
  }

  private populateConfig = (): void => {
    this.config.series.forEach((series: Highcharts.SeriesOptions) => {
      let chartDiv = document.createElement('div');
      this.chart.nativeElement.append(chartDiv);
      this.charts.push(Highcharts.chart(chartDiv, {
        chart: {
            styledMode: true,
            height: this.config.chartHeight || 220
        },
        credits: {
            enabled: false
        },
        title: {
          text: series.name,
          align: 'left'
        },
        legend: {
          enabled: false
        },
        xAxis: {
            categories: this.config.dateOptions,
            crosshair: true
        },
        yAxis: {
            title: {
                text: null
            }
        },
        tooltip: {
          positioner: function (labelWidth) {
              return {
                  x: this.chart.chartWidth - labelWidth, // right aligned
                  y: -1 // align to title
              };
          },
          borderWidth: 0,
          backgroundColor: 'none',
          pointFormatter: function () {
            const nc = numberContract(this.y as number);
            return `${nc.count}${nc.suffix}`;
          },
          headerFormat: '',
          shadow: false,
          style: {
              fontSize: '18px'
          }
        },
        plotOptions: {
          line: {
            marker: {
              enabled: false
            }
          },
          area:{
            marker: {
              enabled: false
            }
          }
        },
        series: [series]
      } as Highcharts.Options));
    });

  }

  private updateSeries = (): void => {
    this.config.series.forEach((series: Highcharts.SeriesOptionsType, i: number) => {
        this.charts[i].update({
            series: [series]
        });
    });
  }

}
