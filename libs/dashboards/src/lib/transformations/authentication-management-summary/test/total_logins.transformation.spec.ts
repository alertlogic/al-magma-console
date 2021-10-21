import { totalLogins } from '../total_logins.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Transformation Test Suite: Total Logins - Authentication Management Summary', () => {
  describe('Given a auth trends response object', () => {
    it('should extract the data and get the totals for successful and failed logins', () => {
      const response = {
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
          ],
          [
            "2020-06-27",
            45022,
            3008
          ],
          [
            "2020-06-28",
            44756,
            3288
          ],
          [
            "2020-06-29",
            73673,
            7146
          ],
          [
            "2020-06-30",
            65690,
            6625
          ],
          [
            "2020-07-01",
            50993,
            5067
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
      expect(totalLogins(response)).toEqual({
        title: '',
        series: [{
          type: 'pie',
          name: '',
          innerSize: '50%',
          data: [{
            name: 'Successful',
            y: 382614,
            className: 'al-yellow-500',
          }, {
            name: 'Failed',
            y: 35082,
            className: 'al-red-500',
          }]
        }],
        dataLabels: {
          style: {
            textOutline: '0px',
            color: 'white'
          }
        }
      });
    });
  });
  describe('Given an empty response (rows.length === 0)', () => {
    it('Should return a zero state object', () => {
      const response = {
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
      expect(totalLogins(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
});
