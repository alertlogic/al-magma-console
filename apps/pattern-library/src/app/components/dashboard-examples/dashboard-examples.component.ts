import { Component } from '@angular/core';
import {
        Widget,
        WidgetContentType,
        WidgetWidth,
        WidgetHeight,
        TableListConfig,
        ActivityGaugeConfig,
        ActivityGaugeValueFormat,
        ZeroState,
        ZeroStateReason
    } from '@al/ng-visualizations-components';

@Component({
  selector: 'app-dashboard-examples',
  templateUrl: './dashboard-examples.component.html',
  styleUrls: ['./dashboard-examples.component.scss']
})
export class DashboardExamplesComponent {

    public baseWidth = 384;
    public baseHeight = 384;
    public widgetHeight: string;
    public widgetWidth: string;
    public count = '999';
    public count2 = '1245';
    public count3 = '34123';
    public count4 = '198765';
    public count5: ZeroState = {
     nodata: true,
     reason: ZeroStateReason.API
    };
    public count6: ZeroState = {
     nodata: true,
     reason: ZeroStateReason.Entitlement
    };
    public failedSemi: ZeroState = {
     nodata: true,
     reason: ZeroStateReason.Zero
    };
    public failedBubble: ZeroState = {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
    public failedTree: ZeroState = {
     nodata: true,
     reason: ZeroStateReason.Zero
    };
    public failedDoughnut: ZeroState = {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
    public dashboards = [
        { label: 'Threat Summary', icon: 'ui-icon-vertical-align-top', value: { id: 6, name: 'Threat Summmary', code: 'TS' }},
        { label: 'Coverage and Health', icon: 'ui-icon-vertical-align-top', value: { id: 1, name: 'Coverage and Health', code: 'CAH' }},
        { label: 'Vulnerability Summary', icon: 'ui-icon-vertical-align-top', value: { id: 2, name: 'Vulnerability Summary', code: 'VS' }}
    ];

    public mockTreeMap: any = [
        {
            id: '1',
            name: 'High',
        },
        {
            id: '2',
            name: 'Medium',
        },
        {
            id: '3',
            name: 'Info',
        },
        {
            id: '4',
            name: 'Low',
        },
        {
            name: '6',
            parent: '1',
            value: 6,
            className: 'high'
        },
        {
            name: 'B',
            parent: '2',
            value: 5,
            className: 'medium'
        },
        {
            name: 'C',
            parent: '3',
            value: 4,
            className: 'info'
        },
        {
            name: 'D',
            parent: '4',
            value: 3,
            className: 'low'
        }
    ];
    public semiCircleData = {
        title: '',
        series: [{
            type: 'pie',
            name: 'Critical and High Classifications',
            innerSize: '50%',
            dataLabels: {
                style: {
                    textOutline: '0px'
                }
            },
            data: [
                {
                    name: 'Brute Force',
                    y: 15.6,
                    className: 'scanned'
                },
                {
                    name: 'Recon',
                    y: 15.3,
                    className: 'not-scanned'
                },
                {
                    name: 'SQL Injection',
                    y: 0,
                    className: 'critical'
                }
            ]
        }]
    };
    public mapComponentTarget = [
      {
        id: 'Belfast',
        lat: 54.597,
        lon: -5.93,
        value: 12,
        className: 'target',
        marker: {
            radius: 12
        }
      },
      {
        id: 'Rome',
        lat: 41.902,
        lon: 12.496,
        value: 12,
        className: 'target',
        marker: {
            radius: 12
        }
      },
      {
        id: 'Dearborn',
        lat: 41.322,
        lon: -83.176,
        value: 8,
        className: 'target',
        marker: {
            radius: 8
        }
      },
      {
        id: 'Iran',
        lat: 35.6961,
        lon: 51.4231,
        value: 10,
        className: 'target',
        marker: {
            radius: 10
        }
      }
    ];

    public mapComponentSource = {
      countries: [
      {
        id: 'Iran',
        lat: 35,
        lon: 51,
        value: 10,
        className: 'source',
        marker: {
            radius: 10
        }
      },
      {
        id: 'United States',
        lat: 44,
        lon: -83,
        value: 8,
        className: 'source',
        marker: {
            radius: 100
        }
      }],
      cities: [{
        id: 'Cardiff',
        lat: 	51,
        lon: -3,
        value: 8,
        className: 'source city',
        marker: {
            radius: 10,
            symbol: 'circle'
        }
      }],
    };

    /*
     *
     */
    public activityGaugeConfig3: ActivityGaugeConfig = {
      value: 0,
      maxValue: 0,
      gaugeClass: 'essential',
      bodyText: 'Usage Based Billing',
      footerText: '<span><span style="font-weight: bold" class="al-red-500">14</span> of 100 Nodes</span>',
      valueFormat: ActivityGaugeValueFormat.ValueOnly,
      contractValues: true,
      overrunClass: 'al-red-500'
    };

    /*
     *
     */
    public activityGaugeConfig1: ActivityGaugeConfig = {
      value: 1761,
      maxValue: 1321,
      gaugeClass: 'essential',
      valueFormat: ActivityGaugeValueFormat.Split,
      contractValues: true,
      overrunClass: 'al-red-500'
    };

    /*
     *
     */
    public activityGaugeConfig2: ActivityGaugeConfig = {
      value: 34,
      maxValue: 3431,
      gaugeClass: 'essential',
      valueFormat: ActivityGaugeValueFormat.Percentage,
      contractValues: true,
      overrunClass: 'al-red-500'
    };


    public columnData = {
        title: '',
        description: 'Total Coverage State',
        dateOptions: ['Monday', 'Tuesday', 'Wednesday', 'Thursda', 'Friday', 'Saturday', 'Sunday'],
        series: [
          {
              name: 'Enterprise',
              data: [[0, 25], [1, 15], [2, 35], [3, 40], [4, 15], [5, 10], [6, 5]],
              className: 'enterprise'
          },
          {
              name: 'Professional',
              data: [[0, 5], [1, 10], [2, 15], [3, 10], [4, 5], [5, 10], [6, 5]],
              className: 'professional'
          },
          {
              name: 'Essential',
              data: [[0, 15], [1, 0], [2, 20], [3, 15], [4, 15], [5, 15], [6, 15]],
              className: 'essential'
          },
          {
              name: 'Unprotected',
              data: [[0, 15], [1, 15], [2, 25], [3, 20], [4, 15], [5, 15], [6, 10]],
              className: 'unprotected'
          }
        ]
    };

    public columnRedData = {
        title: '',
        description: 'Count of Incidents',
        stacking: 'percent',
        yAxisType: 'linear',
        dateOptions: ['brute-force', 'suspicious-activity', 'application-attack', 'recon', 'log-review'],
        series: [
          {
              name: 'Top 20%',
              data: [25, 15, 15, 4, 25],
              className: 'al-blue-200'
          },
          {
              name: '2th 20%',
              data: [5, 10, 25, 30, 5],
              className: 'al-blue-300'
          },
          {
            name: 'Middle 20%',
            data: [5, 10, 25, 30, 5],
            className: 'al-blue-900'
          },
          {
            name: '4th 20%',
            data: [5, 10, 25, 30, 5],
            className: 'al-blue-600'
          },
          {
            name: 'Bottom 20%',
            data: [5, 10, 25, 30, 5],
            className: 'al-blue-800'
          }
        ]
    };

    public tableConfig: TableListConfig = {
        headers: [
            { name: 'Host Name', field: 'summary'},
            { name: 'Count', field: 'count'},
            { name: 'Deployment1', field: 'deployment'}
        ],
        body: [
            { summary: '123.234.45', count: '12.3k', deployment: 'AWS Account', recordLink: 'blaaa' },
            { summary: '123.234.456', count: '12.36', deployment: 'AWS Account2' },
            { summary: '123.4.45', count: '12', deployment: 'AWS Account 1' }
        ]
    };

    public mockBarChart = {
        title: '',
        categories: ['Prod Networks', 'Prod VPC', 'Prod VNET', 'Dev Network', 'Dev VPC'],
        series: [
          {
              type: 'bar',
              name: 'Top 20%',
              data: [ 5, 4, 3, 2 ],
              className: 'high'
          },
          {
              type: 'bar',
              name: 'next top20%',
              data: [ 3, 3, 2, 1 ],
              className: 'medium'
          }
        ]
    };

    public mockBarChart2 = {
      title: '',
      categories: [ 'Critical', 'High', 'Medium', 'Low', 'Info' ],
      series: [
        {
          type: 'bar',
          data: [
            {
                name: 'Critical',
                className: 'high',
                y: 10,
            },
            {
                name: 'High',
                className: 'medium',
                y: 2825,
            },
            {
                name: 'Medium',
                className: 'low',
                y: 39153,
            },
            {
                name: 'Low',
                className: 'info',
                y: 7005,
            },
            {
                name: 'Info',
                className: 'info',
                y: 2499,
            }
          ]
        }
      ]
    };

    public bubbleMock = [
      {
          name: 'Critical',
          value: 10,
          className: 'high'
      },
      {
          name: 'High',
          value: 1000,
          className: 'medium'
      },
      {
          name: 'Medium',
          value: 30000,
          className: 'low'
      },
      {
          name: 'Low',
          value: 15000,
          className: 'info'
      },
      {
          name: 'Info',
          value: 1500,
          className: 'info'
      }
    ];

    public mockAreaChart = {
        categories: ['January', 'February', 'March'],
        name: 'Logs',
        data: [ 3717, 4368, 4018 ],
        color: '#6CA2FF'
    };

    public mockDoughnut = {
      series: [{
        data: [
          {
            y: 300,
            name: 'High',
            className: 'critical',
            percent: '10%'
          },
          {
            y: 100,
            name: 'Medium',
            className: 'medium',
            percent: '13%'
          },
          {
            y: 100,
            className: 'low',
            name: 'Low',
            percent: '20%'
          },
          {
            y: 100,
            className: 'info',
            name: 'Info',
            percent: '20%'
          }
        ]
      }]
    };

    public heatMapConfig = {
      data: {
        xAxis: ['Alexander', 'Marie', 'Maximilian', 'Sophia', 'Lukas', 'Maria', 'Leon', 'Anna', 'Tim', 'Laura'],
        yAxis: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        values: [
          [0, 0, 10], [0, 1, 19], [0, 2, 8], [0, 3, 24], [0, 4, 67], [1, 0, 92], [1, 1, 58], [1, 2, 78], [1, 3, 117],
          [1, 4, 48], [2, 0, 35], [2, 1, 15], [2, 2, 123], [2, 3, 64], [2, 4, 52], [3, 0, 72], [3, 1, 132], [3, 2, 114], [3, 3, 19],
          [3, 4, 16], [4, 0, 38], [4, 1, 5], [4, 2, 8], [4, 3, 117], [4, 4, 115], [5, 0, 88], [5, 1, 32], [5, 2, 12], [5, 3, 6],
          [5, 4, 120], [6, 0, 13], [6, 1, 44], [6, 2, 88], [6, 3, 98], [6, 4, 96], [7, 0, 31], [7, 1, 1], [7, 2, 82], [7, 3, 32],
          [7, 4, 30], [8, 0, 85], [8, 1, 97], [8, 2, 123], [8, 3, 64], [8, 4, 84], [9, 0, 47], [9, 1, 114], [9, 2, 31], [9, 3, 48], [9, 4, 91]
        ]
      },
      presentation: {
        colorSpread: '#b71c1c',
        xAxisTitle: 'Names',
        yAxisTitle: 'Days'
      }
    };

    public doughnutAdvancedConfig = {
      series: [
        {
          data: [
            {
              y: 300,
              className: 'critical',
              name: 'High',
              percent: '10%'
            },
            {
              y: 100,
              className: 'medium',
              name: 'Medium',
              percent: '13%'
            },
            {
              y: 100,
              className: 'low',
              name: 'Low',
              percent: '20%'
            }
          ]
        },
        {
          showInLegend: false,
          data: [
            {
              y: 100,
              className: 'critical',
              name: 'Remote file inclusion attack detected',
              percent: '10%'
            },
            {
              y: 200,
              className: 'critical',
              name: 'Path traversal attack detected',
              percent: '10%'
            },
            {
              y: 30,
              className: 'medium',
              name: 'Cross Site Scripting attack detected',
              percent: '13%'
            },
            {
              y: 70,
              className: 'medium',
              name: 'OS commanding attack detected',
              percent: '13%'
            },
            {
              y: 40,
              className: 'low',
              name: 'HTTP response splitting detected',
              percent: '20%'
            },
            {
              y: 60,
              className: 'low',
              name: 'Local file inclusion attack detected',
              percent: '20%'
            }
          ],
          showDataLabels: true
        }
      ]
    };

    public configs: Widget[] = [
      {
        id: '9',
        title: 'Doughnut',
        actions: {},
        content: {
          type: WidgetContentType.Doughnut,
          data: this.mockDoughnut,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '10',
        title: 'Doughnut - stacked',
        content: {
          type: WidgetContentType.Doughnut,
          data: this.doughnutAdvancedConfig
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '1',
        title: 'Unprotected Nodes',
        actions: {
          primary: {
            name: 'Primary',
            action: {
              target_app: 'foo',
              path: 'bar'
            }
          }
        },
        content: {
          type: WidgetContentType.Count,
          data: this.count,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '101',
        title: 'Unprotected Nodes',
        actions: {
          primary: {
            name: 'Primary',
            action: {
              target_app: 'foo',
              path: 'bar'
            }
          },
          link1: {
            name: 'Primary',
            action: {
              target_app: 'foo',
              path: 'bar'
            }
          },
        },
        content: {
          type: WidgetContentType.Count,
          data: this.count2,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '102',
        title: 'Unprotected Nodes',
        actions: {
          primary: {
            name: 'Primary',
            action: {
              target_app: 'foo',
              path: 'bar'
            }
          },
          link1: {
            name: 'Primary',
            action: {
              target_app: 'foo',
              path: 'bar'
            }
          },
          link2: {
            name: 'Primary',
            action: {
              target_app: 'foo',
              path: 'bar'
            }
          },
        },
        content: {
          type: WidgetContentType.Count,
          data: this.count3,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '103',
        title: 'Unprotected Nodes',
        actions: {
          primary: {
            name: 'Primary',
            action: {
              target_app: 'foo',
              path: 'bar'
            }
          }
        },
        content: {
          type: WidgetContentType.Count,
          data: this.count4,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '105',
        title: 'Failed API Call',
        actions: {
          primary: {
            name: 'Call Sales',
            action: {
              url: 'tel:+18774848383'
            }
          }
        },
        content: {
          type: WidgetContentType.Count,
          data: this.count5,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '106',
        title: 'Failed Entitlement Call',
        actions: {
          primary: {
            name: 'Primary',
            action: {
              target_app: 'foo',
              path: 'bar'
            }
          }
        },
        content: {
          type: WidgetContentType.Count,
          data: this.count6,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '107',
        title: '1 x 1 Widget with SemiCircle - No Data',
        content: {
          type: WidgetContentType.SemiCircle,
          data: this.failedSemi,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '107',
        title: '1 x 1 Widget with BubbleChart - No Data',
        content: {
          type: WidgetContentType.Bubble,
          data: this.failedBubble,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '108',
        title: '1 x 1 Widget with TreeMap - No Data',
        content: {
          type: WidgetContentType.TreeMap,
          data: this.failedTree
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '108',
        title: '1 x 1 Widget with Doughnut - No Data',
        content: {
          type: WidgetContentType.Doughnut,
          data: this.failedDoughnut
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '2',
        title: 'Empty Widget 2 x 1',
        content: {
          type: WidgetContentType.Column,
          data: this.columnData,
        },
        metrics: {
          width: WidgetWidth.W2,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '3',
        title: '2 x 1 Widget with Mixed Chart',
        content: {
          type: WidgetContentType.Column,
          data: this.columnRedData,
        },
        metrics: {
          width: WidgetWidth.W2,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '9',
        title: '1 x 1 Widget with TreeMap',
        content: {
          type: WidgetContentType.TreeMap,
          data: this.mockTreeMap
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '4',
        hideSettings: true,
        title: 'Critical and High Classifications',
        actions: {
          primary: {
            name: 'Primary'
          },
        },
        content: {
          type: WidgetContentType.ActivityGauge,
          data: this.activityGaugeConfig1
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '4',
        hideSettings: true,
        title: 'Critical and High Classifications',
        actions: {
          primary: {
            name: 'Primary'
          },
        },
        content: {
          type: WidgetContentType.ActivityGauge,
          data: this.activityGaugeConfig2
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '4',
        hideSettings: true,
        title: 'Critical and High Classifications',
        actions: {
          primary: {
            name: 'Primary'
          },
        },
        content: {
          type: WidgetContentType.ActivityGauge,
          data: this.activityGaugeConfig3
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '3',
        title: '2 x 1 Widget with List Chart',
        content: {
          type: WidgetContentType.SemiCircle,
          data: this.semiCircleData,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '3',
        title: '2 x 1 Widget with List Chart',
        content: {
          type: WidgetContentType.TableListSummary,
          data: this.tableConfig,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '3',
        title: '2 x 1 Widget with List Chart',
        content: {
          type: WidgetContentType.TableListSummary,
          data: this.tableConfig,
        },
        metrics: {
          width: WidgetWidth.W2,
          height: WidgetHeight.H1,
        },
        actions: {
          drilldown: {
            name: '',
            action: {
              target_app: 'foo',
              path: 'bar'
            }
          }
        }
      },
      {
        id: '3',
        title: '2 x 1 Widget with Bar Chart',
        actions: {},
        content: {
          type: WidgetContentType.Bar,
          data: this.mockBarChart,
        },
        metrics: {
          width: WidgetWidth.W2,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '3',
        title: '1 x 1 Area Chart',
        actions: {},
        content: {
          type: WidgetContentType.Area,
          data: this.mockAreaChart,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '3',
        title: 'Bar Chart',
        actions: {},
        content: {
          type: WidgetContentType.Bar,
          data: this.mockBarChart2,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '7',
        title: 'Bubble',
        actions: {},
        content: {
          type: WidgetContentType.Bubble,
          data: this.bubbleMock,
        },
        metrics: {
          width: WidgetWidth.W1,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '8',
        title: 'Map',
        actions: {},
        content: {
          type: WidgetContentType.Map,
          data: this.mapComponentTarget,
        },
        metrics: {
          width: WidgetWidth.W2,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '8',
        title: 'Map',
        actions: {},
        content: {
          type: WidgetContentType.Map,
          data: this.mapComponentSource,
        },
        metrics: {
          width: WidgetWidth.W2,
          height: WidgetHeight.H1,
        }
      },
      {
        id: '8',
        title: 'Heatmap',
        content: {
          type: WidgetContentType.HeatMap,
          data: this.heatMapConfig.data,
          presentation: this.heatMapConfig.presentation
        },
        metrics: {
          width: WidgetWidth.W2,
          height: WidgetHeight.H1,
        }
      }
    ];

    // For use in template
    public contentType: typeof WidgetContentType = WidgetContentType;

    buttonClicked(e:any) {
      console.dirxml(e);
    }

    viewRecordDetails(e:any) {
      console.dirxml(e);
    }

    /*
     *
     */
    public getHeight(height: WidgetHeight): string {
      return `${height * this.baseHeight}px`;
    }

    /*
     *
     */
    public getWidth(width: WidgetWidth): string {
      return `${width * this.baseWidth}px`;
    }

    public updateData() {
        this.configs[5].content.data = {
          title: '',
          series: [{
              type: 'pie',
              name: 'Critical and High Classifications',
              innerSize: '50%',
              dataLabels: {
                  style: {
                      textOutline: '0px'
                  }
              },
              data: [
                {
                    name: 'Brute Forcey',
                    y: 75.6,
                    color: '#C4D8FC'
                },
                {
                    name: 'Recon Attack',
                    y: 15.3,
                    color: '#77A7F9'
                },
                {
                    name: 'Trojan Horse',
                    y: 26.1,
                    color: '#3E82F7'
                }
              ]
            }]
        };

        this.configs[1].content.data = {
            title: '',
            description: 'Total Coverage State',
            dateOptions: ['Monday', 'Tuesday', 'Wednesday', 'Thursda', 'Friday', 'Saturday', 'Sunday'],
            series: [
              {
                  name: 'Enterprise',
                  data: [[0, 25], [1, 45], [2, 65], [3, 0], [4, 15], [5, 10], [6, 35]],
                  color: '#3FC6F1'
              },
              {
                  name: 'Professional',
                  data: [[0, 5], [1, 10], [2, 15], [3, 10], [4, 5], [5, 16], [6, 15]],
                  color: '#028BA3'
              },
              {
                  name: 'Essential',
                  data: [[0, 65], [1, 40], [2, 0], [3, 0], [4, 5], [5, 75], [6, 25]],
                  color: '#025070'
              },
              {
                  name: 'Unprotected',
                  data: [[0, 25], [1, 35], [2, 5], [3, 10], [4, 50], [5, 15], [6, 50]],
                  color: '#EDEDED'
              }]
          };

        this.configs[8].content.data = {
            title: '',
            categories: ['Prod Networks', 'Prod VPC', 'Prod VNET', 'Dev Network', 'Dev VPC'],
            series: [
              {
                  type: 'bar',
                  name: 'Internal',
                  data: [ 5, 25, 23, 28 ],
                  color: '#3E82F7'
              },
              {
                  type: 'bar',
                  name: 'External',
                  data: [ 13, 32, 12, 10 ],
                  color: '#6CA2FF'
              }
            ]
        };

        this.configs[9].content.data = {
            categories: ['January', 'February', 'March'],
            name: 'Logs',
            data: [ 4717, 2368, 6018 ],
            color: '#6CA2FF'
        };

        this.configs[7].content.data = {
            headers: [
                { name: 'Host Name Test', field: 'summary'},
                { name: 'Count 1', field: 'count'},
                { name: 'Deployment2', field: 'deployment'}
            ],
            body: [
                { summary: '123.234.46', count: '12.3k', deployment: 'AWS Account', recordLink: 'blaaa' },
                { summary: '123.234.46', count: '12.36', deployment: 'AWS Account2' },
                { summary: '123.4.445', count: '12', deployment: 'AWS Account 1' }
            ]
        };
    }
}
