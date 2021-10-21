import { Injectable } from '@angular/core';
import { SeriesClickEventObject } from 'highcharts';
// tslint:disable-next-line:no-duplicate-imports
import * as Highcharts from 'highcharts';

@Injectable({
  providedIn: 'root',
})
export class AlHighChartsUtilityService {

  public pieLegendClickHandler(e: Highcharts.PointLegendItemClickEventObject): void {
    const legendItem: Highcharts.Point = e.target;
    const selfValue = legendItem.y;
    const visibleRemaining = legendItem.series.data.filter(item => item.visible);
    const countVisible = visibleRemaining.length;
    const remainingVisibleValue = visibleRemaining.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.y;
    }, 0) - selfValue;

    // If the count of remaining visibles is only one (must be this one) then don't
    // allow it to be switched off
    if (legendItem.visible && (countVisible === 1 || remainingVisibleValue <= 0)) {
      e.preventDefault();
    }
  }

  /*
   *
   */
  public seriesLegendClickHandler(e: Highcharts.SeriesLegendItemClickEventObject): void {
    const legendItem: Highcharts.Series = e.target;
    const visibleRemaining = legendItem.chart.series.filter(item => item.visible).length;
    if (legendItem.visible && visibleRemaining === 1) {
      e.preventDefault();
    }
  }

  /*
   *
   */
  public seriesMutualClickHandler(e: Highcharts.SeriesLegendItemClickEventObject): void {
    const legendItem: Highcharts.Series = e.target;

    legendItem.chart.series.forEach((series: any) => {
      if(series === legendItem) {
        series.show();
        e.preventDefault();
      } else {
        series.hide();
      }
    });
  }

  /*
   *
   */
  public setMutualSeries (series: Highcharts.SeriesOptions, seriesDescriptions: string[]): Highcharts.SeriesOptions {
    return (series as any).map((series: any, index: number) => {
      return Object.assign(series, {
        visible: index === 0,
        showInLegend: true,
        name: `Show by ${seriesDescriptions[index]}`
      });
    });
  }

  /*
   * Iterate through each item in the data series and add a 'clickable'
   * class to all data elements that contain a recordLink property
   */
  public addClickClass = (series: Highcharts.SeriesOptions[]): void => {
    series.forEach(seriesItem => {
        (seriesItem as any).data.forEach((dataItem:any) => {
        if (dataItem.hasOwnProperty('recordLink')) {
          dataItem.className += ' clickable';
        }
      });
    });
  }

  /*
   *
   */
  public dataElementClick = (event:SeriesClickEventObject ):void => {
    event.target.dispatchEvent(new CustomEvent('data-element-clicked', {
      detail: {
        event,
        recordLink: (event.point as any).recordLink
      },
      bubbles: true
    }));
  }

  public tooltipPointFormatter = (seriesCount: number, point: Highcharts.Point, exclusiveSeries: boolean = false, tooltipString: string = ''): string => {

    // Only allow fixed decimal places up to 5 places
    function multiDP(match: string, p1: number): string {
      let val: number = point.y || 0;
      let dp: number = p1;

      if (dp < 0) dp = 0;
      if (dp > 5) dp = 5;

      return `<span class="detail">${val.toFixed(dp)}</span>`;
    }

    const value: string = point.y.toFixed(0);
    const name: string = String(point.category ? point.category: point.name);
    const seriesName: string = point.series.name;
    let totalCount: string = point.series.data.reduce((a, c) => a + c.y, 0).toFixed(0);

    if(point.series.type === 'column' && seriesCount > 1) {
      totalCount = point.total.toFixed(0); // use the built in total property which for column will be the stack the data point is in
    }
    if(point.series.type === 'line' && seriesCount > 1) {
      totalCount = point.series.chart.series.map(series => {
        return series.data[point.x].y;
      }).reduce((a, b) => a + b, 0).toFixed(0);
    }

    if (tooltipString) {
      // An external total can be passed in that is not part of the chart data
      const match = tooltipString.match((/\{\{\%total\[(\d+)\]}\}/));
      let externalTotal: number = 0;
      let externalTotalPercent: number = 0;


      if (match) {
        externalTotal = Number(match[1]);
        externalTotalPercent = Number((Number(value) / externalTotal * 100).toFixed(1));
      }

      return tooltipString
        .replace(/\{\{name\}\}/g, `<span class="detail">${name}</span>`)
        .replace(/\{\{seriesName\}\}/g, `<span class="description">${seriesName}`)
        .replace(/\{\{value\}\}/g, `<span class="detail">${value}</span>`)
        .replace(/\{\{value:(\d{1})dp\}\}/g, multiDP)
        .replace(/\{\{total\}\}/g, `<span class="detail">${totalCount}</span>`)
        .replace(/\{\{\%total\[(\d+)\]}\}/g, `${externalTotalPercent || ''}`)
        .replace(/\{\{newline\}\}/g, `<br>`);
    }

    if (seriesCount > 1 && !exclusiveSeries) {
      return `
        <span class="detail">${name}</span><br>
        <span class="description">${seriesName}:</span> <span class="detail">${value}</span><br>
        <span class="description">Total:</span> <span class="detail">${totalCount}</span><br>
        <span class="description">% of Total:</span> <span class="detail">${point.percentage.toFixed(1)}%</span>
      `;
    } else {
      return `
        <span class="detail">${name}</span><span class="detail">: ${value}</span><br>
        <span class="description">Total:</span> <span class="detail">${totalCount}</span><br>
        <span class="description">% of Total:</span> <span class="detail">${((point.y / Number(totalCount)) * 100).toFixed(1)}%</span>
      `;
    }
  }
}

