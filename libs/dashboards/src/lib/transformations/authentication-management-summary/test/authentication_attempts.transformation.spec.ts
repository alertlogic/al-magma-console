import { ZeroStateReason } from '@al/ng-visualizations-components';
import { authenticationAttempts } from '../authentication_attempts.transformation';

describe('Incidents count by severity transformation', () => {
  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response = {
        "rows": [],
        "column_info": [
          {
            "type": "varchar",
            "name": "vendor"
          },
          {
            "type": "int8",
            "name": "attempts_count"
          }
        ]
      };

      const config = authenticationAttempts(response);
      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
  describe('when there are results', () => {
    it('should not contain Info if None was not passed in', () => {
      const baseConfig = [
        { name: 'Azure', value: 17060, y: 17060, className: 'al-blue-500' },
        { name: 'Salesforce', value: 175671, y: 175671, className: 'al-orange-500' },
        { name: 'Okta', value: 232142, y: 232142, className: 'al-smokeBlue-500' },
        { name: 'Auth0', value: 576, y: 576, className: 'al-gray-500' }
      ];

      const response = {
        "rows": [
          [
            "Azure",
            17060
          ],
          [
            "Salesforce",
            175671
          ],
          [
            "Okta",
            232142
          ],
          [
            "Auth0",
            576
          ]
        ],
        "column_info": [
          {
            "type": "varchar",
            "name": "vendor"
          },
          {
            "type": "int8",
            "name": "attempts_count"
          }
        ]
      };
      const config = authenticationAttempts(response);
      expect(config).toEqual({
        series: [{
          data: baseConfig
        }]
      });
    });

  });
});
