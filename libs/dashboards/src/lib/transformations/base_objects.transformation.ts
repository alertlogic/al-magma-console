// Base config object for semiCircleData
export const baseSemiCircleObject = {
    title: '',
    series: [{
      type: 'pie',
      name: '',
      innerSize: '50%',
      data: []
    }],
    dataLabels: {
      style: {
        textOutline: '0px',
        color: 'white'
      }
    }
};

// Base config object for column chart
export interface BaseColumnConfig {
  title?: string;
  description?: string;
  dateOptions?: string[];
  series?: BaseColumnConfigSeries[];
  yAxisType?: string;
  chartHeight?: number;// for multi trend
}

export interface BaseColumnConfigSeries {
  name?: string;
  data?: any[];
  className?: string;
  legendIndex?: number;
  showInLegend?: boolean;
  recordLink?: {[p:string]:string};
}

export interface BaseLineConfigSerie {
  x?: number;
  y?: number;
  percentage?: number;
  recordLink?: {[key:string]:string | number};
}
