/**
 * @author Stephen Jones <stephen.jones@alertlogic.com>
 * @copyright Alert Logic, Inc 2019
 */
import { Input, Component, OnChanges, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import heatmap from 'highcharts/modules/heatmap';
import treemap from 'highcharts/modules/treemap';


export enum ColorType {
  ColorStart,
  ColorStop
}

export interface Presentation {
  title?: string;
  seriesTitle?: string;
  colorStart?: string;
  colorStop?: string;
  hideLegend?: boolean;
  legendPos?: string;
  hideLabels?: boolean;
  xAxisTitle?: string;
  yAxisTitle?: string;
  tooltip?: string;
}

@Component({
  selector: 'al-highchart-heatmap',
  templateUrl: './al-highchart-heatmap.component.html',
  styleUrls: ['./al-highchart-heatmap.component.scss']
})
export class AlHighchartHeatMapComponent implements OnChanges {
  public heatMapChart: any;
  @Input() public data: any = [];
  @Input() public presentation: Presentation = {};
  @ViewChild('heatMap', {static:true}) elHeatMap: ElementRef;

  private defaultColorStart: string = '#ffffff';
  private defaultColorStop: string = '#aaaaaa';

  constructor() {
    heatmap(Highcharts);
    treemap(Highcharts);
  }

  /*
   *
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      const curData:string = JSON.stringify(changes.data.currentValue);
      const prevData:string = JSON.stringify(changes.data.previousValue);

      if (changes.data.firstChange) {
        this.createChart();
      }

      if (curData !== prevData) {
        this.updateData(changes.data.currentValue);
      }
    }

    if (changes.presentation) {
      const curPresentation:string = JSON.stringify(changes.presentation.currentValue);
      const prevPresentation:string = JSON.stringify(changes.presentation.previousValue);

      if (curPresentation !== prevPresentation) {
        this.updatePresentation(changes.presentation.currentValue);
      }
    }
  }

  /*
   * Test to see if a valid color is passed in - if not default to greyscale
   */
  private colorSpread = (color: string, colorType: ColorType): string => {
    return /^#[a-z0-9]{3,6}$/.test(color)
      ? color
      : colorType === ColorType.ColorStart ? this.defaultColorStart : this.defaultColorStop;
  }

  /*
   * Bare bones chart with no values
   */
  private createChart = (): void => {
    this.heatMapChart = Highcharts.chart(this.elHeatMap.nativeElement, {
      chart: {
        type: 'heatmap',
        styledMode: true
      },
      credits: {
        enabled: false
      },
      title: {
        text: null
      },
      tooltip: {
        useHTML: true,
        pointFormatter: function () {
          return `<span>${this.value}</span>`;
        },
        headerFormat: '',
        followPointer: false,
        shape: 'callout'
      },
      xAxis: {
        categories: [],
        title: null
      },
      yAxis: {
        categories: [],
        title: null
      },
      legend: {
        enabled: true
      },
      colorAxis: {
        min: 0,
        minColor: this.defaultColorStart,
        maxColor: this.defaultColorStop
      },
      series: [{
        showInLegend: false,
        borderWidth: 1,
        data: [],
        type: 'heatmap',
        dataLabels: {
          enabled: true,
          color: '#000000'
        }
      }]
    });
  }

  /*
   * Update the chart data
   */
  private updateData = (data: any): void => {
    this.heatMapChart.update({
      xAxis: {
        categories: data.xAxis || []
      },
      yAxis: {
        categories: data.yAxis || []
      },
      series: [{
        data: data.values || []
      }]
    });
  }

  /*
   * Update the presentation layer
   */
  private updatePresentation = (presentation: Presentation): void => {
    let legend = {};

    if (presentation.legendPos === 'right') {
      legend = {
        enabled: !presentation.hideLegend,
        verticalAlign: 'top',
        align: 'right',
        layout: 'vertical',
        symbolHeight: 230
      };
    } else {
      legend = {
        enabled: !presentation.hideLegend
      };
    }

    this.heatMapChart.update({
      legend,
      title: {
        text: presentation.title || null
      },
      xAxis: {
        title: presentation.xAxisTitle || null
      },
      yAxis: {
        title: presentation.yAxisTitle || null
      },
      tooltip: {
        pointFormatter: function () {
          if (presentation.tooltip) {
            return presentation.tooltip
              .replace(/\{yName\}/g, this.series.yAxis['categories'][this.y])
              .replace(/\{xName\}/g, this.series.xAxis['categories'][this.x])
              .replace(/\{value\}/g, this.value)
              .replace(/\{x\}/g, this.x)
              .replace(/\{y\}/g, this.y);
          } else {
            return `<span>${this.value}</span>`;
          }
        }
      },
      colorAxis: {
        minColor: this.colorSpread(presentation.colorStart, ColorType.ColorStart),
        maxColor: this.colorSpread(presentation.colorStop, ColorType.ColorStop)
      },
      series: [{
        name: presentation.seriesTitle || null,
        dataLabels: {
          enabled: !presentation.hideLabels
        }
      }]
    });
  }

}

