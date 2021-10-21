/**
 * @author Megan Castleton <megan.castleton@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2019
 */
import { Input, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'al-highchart-treemap',
  templateUrl: './al-highchart-treemap.component.html',
  styleUrls: ['./al-highchart-treemap.component.scss']
})
export class AlHighchartTreeMapComponent implements OnInit {

  public map: any;

  @ViewChild('treeMap', {static:true}) treeMap: ElementRef;
  /**
   * Input to populate the graph - set to 'any' until backend is defined, allowing us to build
   * an interface
   */
  @Input() config: any;

  ngOnInit() {
    this.map = Highcharts.chart(this.treeMap.nativeElement, {
      chart: {
        styledMode: true
      },
      series: [{
        type: 'treemap',
        layoutAlgorithm: 'strip',
        levels: [{
          level: 1,
          dataLabels: {
            enabled: true,
            align: 'left',
            verticalAlign: 'top',
            style: {
              fontSize: '15px',
              fontWeight: 'bold',
              textOutline: '0px',
              color: 'white'
            }
          },

        }],
        tooltip: {
          // tslint:disable-next-line
          pointFormatter: function () {
            return (this as any).value;
          },
        },
        data: this.config,
      }],
      credits: {
        enabled: false
      },
      title: {
        text: ''
      },
      plotOptions: {
        series: {
          events: {
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
      }
    });
  }
}
