/**
 * @author Megan Castleton <megan.castleton@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2019
 */
import { Input, Component, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { SeriesClickEventObject } from 'highcharts';
import { AlHighChartsUtilityService } from '../services/al-highcharts-utility-service';
import proj4 from 'proj4';
// tslint:disable-next-line:no-duplicate-imports
import * as Highcharts from 'highcharts';

import map from 'highcharts/modules/map';

import mapWorld from '@highcharts/map-collection/custom/world.geo.json';

@Component({
    selector: 'al-highmap-chart',
    templateUrl: './al-highmap-chart.component.html',
    styleUrls: ['./al-highmap-chart.component.scss']
})
export class AlHighmapChartComponent implements OnChanges {
    public mapChart:Highcharts.Chart;
    public containerWidth: number;
    public containerHeight: number;

    @ViewChild('chart', {static:true}) chart: ElementRef;

    /**
     * Input to populate the graph - set to 'any' until backend is defined, allowing us to build
     * an interface
     */
    @Input() config: {
      countries: (number | [number, number] | Highcharts.SeriesMappointDataOptions)[];
      cities: (number | [number, number] | Highcharts.SeriesMappointDataOptions)[];
      legendNames?: string[];
      legendVisibility?: boolean[];
    };

    constructor(private utilityService: AlHighChartsUtilityService) {
      map(Highcharts);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ( typeof window !== 'undefined' ) {
            (<any>window).proj4 = proj4;
        }
        if (this.config) {
            if (changes.config.previousValue === undefined && changes.config.currentValue !== undefined) {
              this.populateConfig();
            }
        }
    }

    private populateConfig = (): void => {
        const service = this.utilityService;


        this.mapChart = Highcharts.mapChart(this.chart.nativeElement, {
            chart: {
                map: mapWorld,
                borderWidth: 1,
                styledMode: true,
                animation: false,
            },
            title: {
                text: ''
            },
            mapNavigation: {
                enabled: true
            },
            credits: {
                enabled: false
            },
            tooltip: {
                headerFormat: '',
                shadow: false,
                useHTML: true,
                pointFormat: `
                    <span class="description">{point.id}:</span> <span class="detail">{point.value}</span><br>
                `,
            },
            plotOptions: {
                map: {
                    animation: false,
                },
                series: {
                    point: {
                        events: {
                            click: function (event:SeriesClickEventObject) {
                              service.dataElementClick(event);
                            }
                        }
                    }
                }
            },
            series: [
                {
                    type: 'map',
                    name: 'Basemap',
                    borderColor: '#d6d6d6',
                    nullColor: '#eeeeee',
                    showInLegend: false,
                    animation: false,
                },
                {
                    zIndex: 1,
                    type: 'mappoint',
                    data: this.config.countries,
                    name: this.config.legendNames ? this.config.legendNames[0] : 'Countries',
                    showInLegend: true,
                    dataLabels: {
                        align: 'center',
                        format: `
                            <text class="map-id">{point.id}</text><br>
                            <text class="map-value" x="15" dy="15">{point.value}</text>`,
                    },
                    visible: this.config.legendVisibility ? this.config.legendVisibility[0] : true
                },
                {
                    zIndex: 1,
                    type: 'mappoint',
                    data: this.config.cities,
                    showInLegend: true,
                    name: this.config.legendNames ? this.config.legendNames[1] : 'Cities',
                    dataLabels: {
                        align: 'center',
                        format: `
                            <text class="map-id">{point.id}</text><br>
                            <text class="map-value" x="15" dy="15">{point.value}</text>`,
                    },
                    visible: this.config.legendVisibility ? this.config.legendVisibility[1] : false
                },
            ]
        });
    }

}
