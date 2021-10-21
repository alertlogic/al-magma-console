import { wlaIncidentTrendSeverity } from '../wla_incident_trend_by_severity.transformation';
import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import { SeverityCountSummaries } from '../../kalm.named_query_response.types';
import { getLocalShortDate } from '../../transformation.utilities';

describe('Top Attackers By Trend and Severity Transformation Test Suite:', () => {

  describe('when there are zero results returned', () => {
    it('should return a zero state reason for no results', () => {
      const response = {
        rows: [],
      };
      expect(wlaIncidentTrendSeverity(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are results', () => {
    it('should return a correctly constructed Highcharts series options object', () => {
      const startDTA = new Date(Date.UTC(2019, 7, 13, 0, 0, 0, 0)).getTime() / 1000;
      const endDTA = new Date(Date.UTC(2019, 7, 13, 23, 59, 59, 999)).getTime() / 1000;
      const startDTB = new Date(Date.UTC(2019, 7, 12, 0, 0, 0, 0)).getTime() / 1000;
      const endDTB = new Date(Date.UTC(2019, 7, 12, 23, 59, 59, 999)).getTime() / 1000;
      const wlaIncidentTrendSummaries: SeverityCountSummaries = {
        rows: [
          [
            "2019-08-13",
            {
              Critical: 2,
              Medium: 14,
              High: 4,
              Low: 2,
              Info: 2
            }
          ],
          [
            "2019-08-12",
            {
              Critical: 3,
              Medium: 17,
              High: 2,
              Low: 1,
              Info: 1
            }
          ]
        ]
      };

      expect(wlaIncidentTrendSeverity(wlaIncidentTrendSummaries)).toEqual({
        xAxis: {
          categories: [
            getLocalShortDate(new Date('2019-08-13T00:00:00.000Z')),
            getLocalShortDate(new Date('2019-08-12T00:00:00.000Z'))
          ]
        },
        yAxis: {
          title: {
            text: 'Count of Incidents'
          }
        },
        series: [{
          name: 'Info',
          data: [{
            x: 0,
            y: 2,
            recordLink: {
              threat: 'Info',
              startDate: startDTA,
              endDate: endDTA,
              source: 'WLA'
            }
          }, {
            x: 1,
            y: 1,
            recordLink: {
              threat: 'Info',
              startDate: startDTB,
              endDate: endDTB,
              source: 'WLA'
            }
          }],
          className: 'info2',
          type: 'area'
        }, {
          name: 'Low',
          data: [{
            x: 0,
            y: 2,
            recordLink: {
              threat: 'Low',
              startDate: startDTA,
              endDate: endDTA,
              source: 'WLA'
            }
          }, {
            x: 1,
            y: 1,
            recordLink: {
              threat: 'Low',
              startDate: startDTB,
              endDate: endDTB,
              source: 'WLA'
            }
          }],
          className: 'info',
          type: 'area'
        }, {
          name: 'Medium',
          data: [{
            x: 0,
            y: 14,
            recordLink: {
              threat: 'Medium',
              startDate: startDTA,
              endDate: endDTA,
              source: 'WLA'
            }
          }, {
            x: 1,
            y: 17,
            recordLink: {
              threat: 'Medium',
              startDate: startDTB,
              endDate: endDTB,
              source: 'WLA'
            }
          }],
          className: 'low',
          type: 'area'
        }, {
          name: 'High',
          data: [{
            x: 0,
            y: 4,
            recordLink: {
              threat: 'High',
              startDate: startDTA,
              endDate: endDTA,
              source: 'WLA'
            }
          }, {
            x: 1,
            y: 2,
            recordLink: {
              threat: 'High',
              startDate: startDTB,
              endDate: endDTB,
              source: 'WLA'
            }
          }],
          className: 'medium',
          type: 'area'
        },
        {
          name: 'Critical',
          data: [{
            x: 0,
            y: 2,
            recordLink: {
              threat: 'Critical',
              startDate: startDTA,
              endDate: endDTA,
              source: 'WLA'
            }
          }, {
            x: 1,
            y: 3,
            recordLink: {
              threat: 'Critical',
              startDate: startDTB,
              endDate: endDTB,
              source: 'WLA'
            }
          }],
          className: 'critical',
          type: 'area'
        }],
        legend: {
          reversed: true
        }
      });
    });
  });
});
