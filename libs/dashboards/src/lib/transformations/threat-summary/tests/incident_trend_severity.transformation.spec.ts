import * as Transformation from '../incident_trend_severity.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { SeverityCountSummaries } from '../../kalm.named_query_response.types';
import { getLocalShortDate } from '../../transformation.utilities';

describe('Incident Trend Severity Transformation Test Suite:', () => {

  const startDTA = new Date(Date.UTC(2019, 7, 12, 0, 0, 0, 0)).getTime() / 1000;
  const endDTA = new Date(Date.UTC(2019, 7, 12, 23, 59, 59, 999)).getTime() / 1000;
  const startDTB = new Date(Date.UTC(2019, 7, 13, 0, 0, 0, 0)).getTime() / 1000;
  const endDTB = new Date(Date.UTC(2019, 7, 13, 23, 59, 59, 999)).getTime() / 1000;
  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const incidentSeverities: SeverityCountSummaries = {
        rows: [],
      };

      const config = Transformation.incidentTrendSeverity(incidentSeverities);
      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
  describe('when there are results', () => {
    it('should return a correctly constructed Highcharts options object', () => {
      const incidentSeverities: SeverityCountSummaries = {
        rows: [
          [
            "2019-08-12",
            {
              Medium: 14,
              Critical: 4
            }
          ],
          [
            "2019-08-13",
            {
              Medium: 17,
              Critical: 2
            }
          ]
        ]
      };

      const config = Transformation.incidentTrendSeverity(incidentSeverities);
      expect(config).toEqual({
        xAxis: {
          categories: [
            getLocalShortDate(new Date('2019-08-12T00:00:00.000Z')),
            getLocalShortDate(new Date('2019-08-13T00:00:00.000Z'))
          ]
        },
        yAxis: {
          title: {
            text: 'Count of Incidents'
          }
        },
        series: [{
          name: 'Medium',
          data: [{
            x: 0,
            y: 14,
            recordLink: {
              threat: 'Medium',
              startDate: startDTA,
              endDate: endDTA
            }
          },{
            x: 1,
            y: 17,
            recordLink: {
              threat: 'Medium',
              startDate: startDTB,
              endDate: endDTB
            }
          }],
          className: 'low',
          type: 'area'
        },{
          name: 'Critical',
          data: [{
            x: 0,
            y: 4,
            recordLink: {
              threat: 'Critical',
              startDate: startDTA,
              endDate: endDTA
            }
          },{
            x: 1,
            y: 2,
            recordLink: {
              threat: 'Critical',
              startDate: startDTB,
              endDate: endDTB
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
