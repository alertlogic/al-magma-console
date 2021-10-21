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
    selector: 'al-highchart-semi-circle',
    templateUrl: './al-highchart-semi-circle.component.html',
    styleUrls: ['./al-highchart-semi-circle.component.scss']
})
export class AlHighchartSemiCircleComponent implements OnChanges {


  public containerWidth: number;
  public containerHeight: number;

  public semiCircle: any;
  @ViewChild('semiCircle', {static:true}) semiCircleEl: ElementRef;

  /**
   * Input to populate the graph - set to 'any' until backend is defined, allowing us to build
   * an interface
   */
  @Input() config: any;

  /*
   *
   */
  constructor(private utilityService: AlHighChartsUtilityService) { }

  /*
   *
   */
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

  /*
   *
   */
  private populateConfig = (): void => {
    const service = this.utilityService;
    this.semiCircle = Highcharts.chart(this.semiCircleEl.nativeElement, {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        styledMode: true,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
        spacingLeft: 0,
        spacingRight: 0,
        spacingBottom: 40,
        spacingTop: 10
      },
      credits: {
        enabled: false
      },
      title: {
        text: this.config.title || ''
      },
      tooltip: {
        useHTML: true,
        pointFormat: `
          <span class="description">{point.name}:</span> <span class="detail">{point.y}</span><br>
          <span class="description">Total:</span> <span class="detail">{point.total}</span><br>
          <span class="description">% of Total:</span> <span class="detail">{point.percentage:.1f}%</span>
        `,
        headerFormat: '',
        followPointer: false,
        shape: 'callout'
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            softConnector: false,
            distance: 15,
            // tslint:disable-next-line
            formatter: function() {
              if ( this.point.y === 0 ) {
                return null;
              } else {
                let count: string;
                if ( this.point.y > 1000 ) {
                  count = this.point.y > 1000000 ?
                    Highcharts.numberFormat( this.point.y / 1000000, 1 ) + 'M' :
                    Highcharts.numberFormat( this.point.y / 1000, 1 ) + 'K';
                } else {
                  count = String(this.point.y);
                }
                return count;
              }
            }
          },
          showInLegend: true,
          startAngle: -90,
          endAngle: 90,
          center: ['50%', '65%'],
          size: '75%',
          point: {
            events: {
              legendItemClick: function (e: Highcharts.PointLegendItemClickEventObject) {
                service.pieLegendClickHandler(e);
              }
            }
          }
        },
        series: {
          events: {
            click: function (event: SeriesClickEventObject) {
              service.dataElementClick(event);
            }
          }
        }
      },
      series: this.config.series || []
    });
  }

  /*
   *
   */
  private updateSeries = (): void => {
    this.semiCircle.update({
      series: this.config.series
    });
  }
}
