import { authenticationUserTrends } from '../authentication_user_trends.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { getLocalShortDate } from '../../transformation.utilities';

describe('Authentication Management Summary - Authentication User Trends Test Suite:', () => {
  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const authData = {
        "rows": [],
        "column_info": [
          {
            "type": "date",
            "name": "day"
          },
          {
            "type": "int8",
            "name": "successful_login_count"
          },
          {
            "type": "int8",
            "name": "failed_login_count"
          }
        ]
      };

      const config = authenticationUserTrends(authData);

      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are results', () => {
    it('should return a correctly constructed Highcharts options object', () => {
      const authData = {
        "rows": [
          [
            "2020-06-25",
            49064,
            3824
          ],
          [
            "2020-06-26",
            53416,
            6124
          ]
        ],
        "column_info": [
          {
            "type": "date",
            "name": "day"
          },
          {
            "type": "int8",
            "name": "successful_login_count"
          },
          {
            "type": "int8",
            "name": "failed_login_count"
          }
        ]
      };

      const config = authenticationUserTrends(authData);

      expect(config).toEqual({
        xAxis: {
          categories: [
            getLocalShortDate(new Date('2020-06-25T00:00:00.000Z')),
            getLocalShortDate(new Date('2020-06-26T00:00:00.000Z'))
          ]
        },
        yAxis: {
          title: {
            text: 'Count of Logins'
          }
        },
        series: [{
          name: 'Successful',
          data: [{
            x: 0,
            y: 49064,
          }, {
            x: 1,
            y: 53416,
          }],
          className: 'al-yellow-500',
          type: 'area'
        }, {
          name: 'Failed',
          data: [{
            x: 0,
            y: 3824,
          }, {
            x: 1,
            y: 6124,
          }],
          className: 'al-red-500',
          type: 'area'
        }],
        legend: {
          reversed: true
        }
      });
    });
  });
});
