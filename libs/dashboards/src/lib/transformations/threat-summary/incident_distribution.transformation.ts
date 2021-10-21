import { Widget as WidgetConfig } from '@al/ng-visualizations-components';
import * as Highcharts from 'highcharts';

enum Column {
  AttackClass,
  AccountCount,
  AccountQuintile,
  IncidentCount,
  Quintile
}

type IncidentRow = (string|number)[];

/*
 *
 */
const getQuintiles = (attackClasses: string[], quintile: number, data: IncidentRow[]): number[] => {
  const values: number[] = [];
  for (const attackClass of attackClasses) {
    const quintileItem: IncidentRow = data.find(item => item[Column.AttackClass] === attackClass && item[Column.Quintile] === quintile);
    values.push(<number>quintileItem[Column.IncidentCount]);
  }
  return values;
};

/*
 *
 */
const getRankings = (attackClasses: string[], data: IncidentRow[]): number[] => {
  const values: number[] = [];

  for (const attackClass of attackClasses) {
    const items: IncidentRow[] = data.filter(item => item[Column.AttackClass] === attackClass).sort((a,b) => <number>a[Column.Quintile] - <number>b[Column.Quintile]);
    const highValue: number = <number>items[4][Column.IncidentCount];
    const accountQuintile: number = <number>items[0][Column.AccountQuintile];

    if (items[0][Column.AccountQuintile] === 1) {
      values.push(((<number>items[0][Column.AccountCount] / 2) / highValue) * 100);
    } else {
      const val1: number = <number>items[accountQuintile - 1][Column.IncidentCount];
      const val2: number = <number>items[accountQuintile - 2][Column.IncidentCount];
      const value: number = ((((val1 - val2) / 2) + val2) / highValue) * 100;
      values.push(Math.round(value));
    }
  }
  return values;
};

/*
 *
 */
export const incidentDistribution = ({ rows }: { rows: IncidentRow[] }, item?: WidgetConfig) => {
  const attackClasses: string[] = [...Array.from(new Set(rows.map(row => row[Column.AttackClass])))] as string[];
  const primaryClassName = 'al-red';
  const secondaryClassName = 'al-gray';
  const config = {
    title: '',
    stacking: 'percent',
    yAxisType: 'linear',
    dateOptions: attackClasses,
    series: [{
      name: 'Top 20%',
      data: getQuintiles(attackClasses, 5, rows),
      className: `${primaryClassName}-900`
    }, {
      name: '2nd 20%',
      data: getQuintiles(attackClasses, 4, rows),
      className: `${primaryClassName}-600`
    }, {
      name: 'Middle 20%',
      data: getQuintiles(attackClasses, 3, rows),
      className: `${primaryClassName}-300`
    }, {
      name: '4th 20%',
      data: getQuintiles(attackClasses, 2, rows),
      className: `${secondaryClassName}-500`
    }, {
      name: 'Bottom 20%',
      data: getQuintiles(attackClasses, 1, rows),
      className: `${secondaryClassName}-300`
    }, {
      type: 'line',
      name: 'Your ranking',
      data: getRankings(attackClasses, rows)
    }]
  };

  return config;
};
