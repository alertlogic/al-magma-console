import { authIncidentClassificationTrends } from '../incident_classification_trends.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { getLocalShortDate, kalmDateStringToJSDate } from '../../transformation.utilities';

describe('Authentication management security - Incident Classification Trends Test Suite:', () => {
  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const incidentsData = {
        "rows": [],
        "column_info": [
          {
            "type": "date",
            "name": "day"
          },
          {
            "type": "jsonb",
            "name": "classification_counts"
          }
        ]
      };

      const config = authIncidentClassificationTrends(incidentsData);

      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are results', () => {
    const startDTA = kalmDateStringToJSDate("2020-07-08").getTime() / 1000;
    const endDTA = kalmDateStringToJSDate("2020-07-08", 23, 59, 59, 999).getTime() / 1000;
    const startDTB = kalmDateStringToJSDate("2020-07-09").getTime() / 1000;
    const endDTB = kalmDateStringToJSDate("2020-07-09", 23, 59, 59, 999).getTime() / 1000;
    it('should return a correctly constructed Highcharts options object', () => {
      const incidentsData = {
        "rows": [
          [
            "2020-07-08",
            {
              "authentication:activity": 19,
              "admin:activity": 2
            }
          ],
          [
            "2020-07-09",
            {
              "authentication:activity": 7,
              "admin:activity": 1
            }
          ]
        ],
        "column_info": [
          {
            "type": "date",
            "name": "day"
          },
          {
            "type": "jsonb",
            "name": "classification_counts"
          }
        ]
      };

      const config = authIncidentClassificationTrends(incidentsData);

      expect(config).toEqual({
        xAxis: {
          categories: [
            getLocalShortDate(new Date('2020-07-08T00:00:00.000Z')),
            getLocalShortDate(new Date('2020-07-09T00:00:00.000Z'))
          ]
        },
        yAxis: {
          title: {
            text: 'Count of Incidents'
          }
        },
        series: [{
          name: 'admin:activity',
          data: [{
            x: 0,
            y: 2,
            recordLink: {
              source: 'LOG',
              advancedSearchQuery: `Classification = "admin:activity"`,
              startDate: startDTA,
              endDate: endDTA
            }
          }, {
            x: 1,
            y: 1,
            recordLink: {
              source: 'LOG',
              advancedSearchQuery: `Classification = "admin:activity"`,
              startDate: startDTB,
              endDate: endDTB
            }
          }],
          className: 'al-blue-500',
          type: 'area'
        }, {
          name: 'authentication:activity',
          data: [{
            x: 0,
            y: 19,
            recordLink: {
              source: 'LOG',
              advancedSearchQuery: `Classification = "authentication:activity"`,
              startDate: startDTA,
              endDate: endDTA
            }
          }, {
            x: 1,
            y: 7,
            recordLink: {
              source: 'LOG',
              advancedSearchQuery: `Classification = "authentication:activity"`,
              startDate: startDTB,
              endDate: endDTB
            }
          }],
          className: 'al-purple-500',
          type: 'area'
        }],
        legend: {
          reversed: true
        }
      });
    });
  });
});
