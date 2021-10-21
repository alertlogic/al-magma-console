/*
 * @author Stephen Jones <stephen.jones@alertlogic.com>
 * @copyright Alert Logic, Inc 2020
 *
 */

import { Component, OnChanges, ViewChild, ElementRef, SimpleChanges, Input } from '@angular/core';
import { MapGeoCoords, MapDistributionDataSet, MapDistributionPresentation, MapDistributionDataItem } from '../types';
import { AlHighChartsUtilityService } from '../services/al-highcharts-utility-service';
import * as Highcharts from 'highcharts';
import map from 'highcharts/modules/map';
import proj4 from 'proj4';

import mapWorld from '@highcharts/map-collection/custom/world.geo.json';

// Points on charts are x / y rather than long / lat
interface GeoPoint {
  x: number;
  y: number;
}

type Quintiles =  number[];
type QuintileSet = Quintiles[];

interface DataClassItem {
  to?: number;
  from?: number;
}

@Component({
  selector: 'al-chart-map-distribution',
  templateUrl: './al-chart-map-distribution.component.html',
  styleUrls: ['./al-chart-map-distribution.component.scss']
})

export class AlChartMapDistribution implements OnChanges {
  @ViewChild('chartContainer', {static:true}) chartContainer: ElementRef;
  @Input() data: MapDistributionDataSet[] = [];
  @Input() presentation: MapDistributionPresentation = {};

  // Default to blue color scheme - can be driven from presentation
  public currentColor = 'al-blue';
  public seriesNames: string[] = [];
  public chart: Highcharts.Chart;
  public currentDataSet: number = 0;
  public seriesData: MapDistributionDataSet[] = [];
  public seriesHasData: boolean[] = [];

  private colorScheme: string[] = ['al-blue', 'al-purple', 'al-green', 'al-amber', 'al-red', 'al-orange', 'al-yellow', 'al-smokeBlue', 'al-gray'];
  private quintileSet: QuintileSet = [];
  private currentQuintiles: Quintiles = [];

  /*
   *
   */
  constructor(private utilityService: AlHighChartsUtilityService) {
    map(Highcharts);
  }

  /*
   *
   */
  ngOnChanges(changes: SimpleChanges) {
    if (typeof window !== 'undefined') {
      (<any>window).proj4 = proj4;
    }

    // First time in? If so set up the chart.
    if (this.chart === undefined) {
      this.setupChart();
    }

    // Presentation changed
    if (changes.presentation.currentValue !== changes.presentation.previousValue) {
      this.setPresentation(changes.presentation.currentValue);
    }

    // Data changed
    if (changes.data.currentValue !== changes.data.previousValue) {
      this.seriesHasData = changes.data.currentValue.map((item: MapDistributionDataItem[]) => item.length > 0);
      this.quintileSet = this.generateQuintiles(changes.data.currentValue);
      this.currentQuintiles = this.quintileSet[this.currentDataSet];
      this.seriesData = this.generateSeriesData(changes.data.currentValue, this.quintileSet, this.colorScheme);
      this.selectDataSet(this.seriesData, this.currentDataSet);
    }
  }

  /*
   *
   */
  public onClickLegend(idx: number): void {
    this.currentDataSet = idx;
    this.currentColor = this.colorScheme[idx];
    this.currentQuintiles = [...this.quintileSet[idx]];
    this.selectDataSet(this.seriesData, this.currentDataSet);
  }

  /*
   *
   */
  public legendColor(idx: number): string {
    return idx === this.currentDataSet ? `${this.colorScheme[idx]}-900` :  'al-gray-50';
  }

  /*
   *
   */
  public legendTextColor(idx: number): string {
    return idx === this.currentDataSet ? 'selected' : 'not-selected';
  }

  /*
   *
   */
  public containerClasses(): string {
    const legendClass: string = this.seriesHasData[this.currentDataSet] ? '' : ' hide-legend';
    return `${this.currentColor}${legendClass}`;
  }

  /*
   *
   */
  private deepCopy(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }

  /*
   *
   */
  private selectDataSet(seriesData: MapDistributionDataSet[], index: number): void {
    const dataClasses = this.setDataClasses(this.currentQuintiles);
    this.chart.update({
      colorAxis: {
        dataClasses,
        dataClassColor: 'category'
      }
    });
    this.chart.series[0].setData(seriesData[index], true);
  }

  /*
   *
   */
  private setPresentation(presentation: MapDistributionPresentation): void {
    const schemeArray: boolean = Array.isArray(presentation.colorScheme);
    const seriesArray: boolean = Array.isArray(presentation.seriesNames);

    // If an array of colours has been passed in then use it
    if (schemeArray) {
      this.colorScheme = [...(<string[]>presentation.colorScheme)];
    }

    // If an array of series names has been passed in then use it
    // Pad it out to ten in length in case the array of names is length
    // than the data array length - in which case we have some named back ups
    // This only happens if an array of series names is passed in initially, as if they
    // aren't then the expectation is that none are required.
    if (seriesArray) {
      const len: number = (<string[]>presentation.seriesNames).length;
      const additions: string[] = [...Array(len + 1).keys()].map(i => `Series ${i}`).slice(1);
      this.seriesNames = [...(<string[]>presentation.seriesNames), ...additions];
    }

    // Set the current colour to the first colour
    this.currentColor = this.colorScheme[this.currentDataSet];
  }

  /*
   * Builds the quintile boundaries for a dataset based on min and max values
   * When a dataset has no data send back an empty quintile set
   *
   * In order to keep the quintiles we must force the range to five if the range
   * falls below that
   */
  private generateQuintiles(data: MapDistributionDataSet[]): QuintileSet {
    const quintileSet: QuintileSet = [];

    for(let series of data) {
      if (series.length > 0) {
        const dataOrig: MapDistributionDataItem[] = this.deepCopy(series).sort((a: any, b: any) => b.value - a.value);
        const lowValue: number = dataOrig[dataOrig.length - 1].value;
        const highValue: number = dataOrig[0].value;
        const range: number = highValue - lowValue < 5 ? 5 : highValue - lowValue;
        const fifth: number = range * .2;
        const quintiles: Quintiles = [];

        for (let i = 0; i < 5; i++) {
          quintiles.push(lowValue + fifth * i);
        }

        quintileSet.push(quintiles);
      } else {
        quintileSet.push([]);
      }
    }

    return quintileSet;
  }

  /*
   * Update the chart data - also updates the data classes
   */
  private generateSeriesData(data: MapDistributionDataSet[], quintileSet: QuintileSet, colorScheme: string[]): MapDistributionDataSet[] {
    return data.map((dataSetItem: MapDistributionDataSet, idx: number) => {
      return this.completeDataSet(this.deepCopy(dataSetItem).sort((a: any, b:any) => b.value - a.value), quintileSet[idx], colorScheme[idx]);
    });
  }

  /*
   * Split the range of values over 5 segments
   */
  private setDataClasses(quintiles: Quintiles): DataClassItem[] {
    return [
      {
        from: 0,
        to: quintiles[1]
      },
      {
        from: quintiles[1],
        to: quintiles[2]
      },
      {
        from: quintiles[2],
        to: quintiles[3]
      },
      {
        from: quintiles[3],
        to: quintiles[4]
      },
      {
        from: quintiles[4],
      }
    ];
  }

  /*
   * Determines where avalue lays in the quintiles and returns the requisite color
   */
  private classNameFromValue(value: number, quintiles: Quintiles, currentColor: string): string {
    const index: number = quintiles.findIndex((item: number) => value < item);
    let className: string = '';

    switch (index) {
      case 0:
        className = `${currentColor}-50`;
        break;
      case 1:
        className = `${currentColor}-200`;
        break;
      case 2:
        className = `${currentColor}-400`;
        break;
      case 3:
        className = `${currentColor}-600`;
        break;
      default:
        className = `${currentColor}-800`;
    }

    return className;
  }

  /*
   * Takes the supplied data and fills in missing country codes if need be
   * Also applies the required class based on the position in the quintile range
   */
  private completeDataSet(data: MapDistributionDataItem[], quintiles: Quintiles, currentColor: string): MapDistributionDataItem[] {
    const dataOrig: MapDistributionDataItem[] = this.deepCopy(data);
    return dataOrig.map((item: MapDistributionDataItem) => {
      item = Object.assign({}, item, {
        code: item.code ? item.code : this.getCountryCode(item.coords, item.name),
        className: this.classNameFromValue(item.value, quintiles, currentColor)
      });
      return item;
    });
  }

  /*
   * Determine if the Highcharts x / y coords appear within a polygon
   */
  private pointInPolygon(polygon: any, point: GeoPoint): boolean {
    const len: number = polygon.length;
    let found = false;
    for(let i = 0, j = len-1; i < len; j = i++) {
      if( ((polygon[i][1] > point.y) !== (polygon[j][1] > point.y)) &&
         (point.x < (polygon[j][0] - polygon[i][0]) * (point.y - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
        found = !found;
      }
    }
    return found;
  }

  /*
   * Takes a long / lat object (MapGeoCoords), and converts it into a Highcharts point object (GeoPoint)
   *  Then iterates through the worldmap's polygon to see if the GeoPoint appears anywhere in any of the
   *  country polygons. If a match is found grab the country code and return it.
   */
  private getCountryCode(geo: MapGeoCoords, name: string): string {
    const geoPoint: GeoPoint = this.chart.fromLatLonToPoint(geo);
    const countryCount: number = mapWorld.features.length;
    let found: boolean = false;
    let countryCode = '';
    let i = 0;
    while (!found && i < countryCount) {
      const item: any = mapWorld.features[i];
      if (item.geometry.type === 'Polygon') {
        found = this.pointInPolygon(item.geometry.coordinates[0], {x: Math.abs(geoPoint.x), y: Math.abs(geoPoint.y)});
        if (found) {
          countryCode = item.id;
        }
      } else if (item.geometry.type === 'MultiPolygon') {
        const subItems: number = item.geometry.coordinates.length;
        let x = 0;
        while (!found && x < subItems) {
          found = this.pointInPolygon(item.geometry.coordinates[x][0], {x: Math.abs(geoPoint.x), y: Math.abs(geoPoint.y)});
          if (found) {
            countryCode = item.id;
          }
          x++;
        }
      }
      i++;
    }

    // As a last resort try by country name - spelling mistakes make this a last resort
    if (!countryCode) {
      const feature: any = mapWorld.features.find((item: any) => item.properties.name === name);
      if (feature) {
        countryCode = feature.properties['hc-a2'];
      }
    }

    return countryCode;
  }

  /*
   * Initial chart setup
   */
  private setupChart = (): void => {
    const data: MapDistributionDataItem[] = [];
    const service = this.utilityService;
    const legend: any = {
        title: {
          text: ''
        },
        align: 'left',
        verticalAlign: 'bottom',
        floating: true,
        layout: 'vertical',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        symbolRadius: 0,
        symbolHeight: 14
    };

    // Had to use legend: any as "valueDecimals" is not typed on legend
    legend['valueDecimals'] = 0;

    this.chart = Highcharts.mapChart(this.chartContainer.nativeElement, {
      legend,
      chart: {
        map: mapWorld,
        borderWidth: 1,
        animation: false,
        styledMode: true
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
      colorAxis: {
        dataClassColor: 'category'
      },
      tooltip: {
        headerFormat: '',
        shadow: false,
        useHTML: true,
        pointFormat: `<span class="description">{point.name}:</span> <span class="detail">{point.value}</span><br>`
      },
      plotOptions: {
        map: {
          animation: false,
        },
        series: {
          point: {
            events: {
              click: function (event: Highcharts.SeriesClickEventObject) {
                service.dataElementClick(event);
              }
            }
          }
        }
      },
      series: [{
        data,
        nullColor: '#ededed',
        name: '',
        animation: true,
        showInLegend: false,
        joinBy: ['iso-a2', 'code'],
        type: 'map'
      }] as any
    });
  }
}
