/**
 * @author Robert Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */
import { Input, Component, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { AlHighChartsUtilityService } from '../services/al-highcharts-utility-service';
import * as Highcharts from 'highcharts';
import funnel from 'highcharts/modules/funnel';
import { numberContract } from '../formatters';

@Component({
  selector: 'al-highchart-funnel',
  templateUrl: './al-highchart-funnel.component.html',
  styleUrls: ['./al-highchart-funnel.component.scss']
})
export class AlHighchartFunnelComponent implements OnChanges {
  @ViewChild('chart', {static:true}) chart: ElementRef;

  public funnelChart: Highcharts.Chart;
  /**
   * Input to populate the graph - set to 'any' until backend is defined, allowing us to build
   * an interface
   */
  @Input() config: any;


  /*
   *
   */
  constructor(private utilityService: AlHighChartsUtilityService) {
    funnel(Highcharts);
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

  private populateConfig = (): void => {

    const funnelPlotOptions: Highcharts.PlotFunnelOptions = {
      dataLabels: {
        enabled: true,
        distance: 10,
        formatter: function () {
          const nc = numberContract(this.point['value']);
          return `${nc.count}${nc.suffix}`;
        },
        connectorWidth: 0
      },
      center: ['50%', '50%'],
      neckWidth: '30%',
      neckHeight: '25%',
      width: '80%'
    };

    this.funnelChart = Highcharts.chart(this.chart.nativeElement, {
      chart: {
        type: 'funnel',
        styledMode: true,
      },
      credits: {
        enabled: false
      },
      title: {
        text: this.config.title
      },
      tooltip: {
        pointFormatter: function () {
          const totalCount: number = this.series.data.reduce((a, c) => a + c['value'], 0);
          return `
            <span class="detail">${this.name}</span><span class="detail">: ${this['value']}</span><br>
            <span class="description">Total:</span> <span class="detail">${Math.round(totalCount * 100) / 100}</span><br>
          `;
        },
        headerFormat: '',
        shadow: false,
        useHTML: true
      },
      plotOptions: {
        series: funnelPlotOptions
      },
      legend: {
        enabled: true
      },
      series: this.config.series,

    } as Highcharts.Options);
  }

  private updateSeries = (): void => {
    this.funnelChart.update({
      series: this.config.series
    });
  }
}
