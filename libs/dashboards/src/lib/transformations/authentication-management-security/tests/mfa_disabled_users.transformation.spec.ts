import { mfaDisabledUsers } from '../mfa_disabled_users.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('MFA disabled users', () => {

  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response: { rows: string[][], column_info: { type: string, name: string }[] } = {
        rows: [],
        column_info: []
      };
      const config = mfaDisabledUsers(response);

      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are results', () => {
    it('should return a list of the MFA disabled users', () => {
      const response: { rows: string[][], column_info: { type: string, name: string }[] } = {
        "rows": [
          [
            "Winans, Todd",
            "2020-07-22"
          ],
          [
            "Gollapalli, Lakshmi",
            "2020-07-20"
          ]
        ],
        "column_info": [
          {
            "type": "varchar",
            "name": "user_name"
          },
          {
            "type": "date",
            "name": "max"
          }
        ]
      };

      const config = mfaDisabledUsers(response);
      expect(config).toEqual({
        headers: [
          { name: 'User Name', field: 'user_name', class: 'left' },
          { name: 'Date disabled', field: 'date', class: 'left' }
        ],
        body: [
          {
            user_name: "Winans, Todd",
            date: "2020-07-22",
          },
          {
            user_name: "Gollapalli, Lakshmi",
            date: "2020-07-20",
          }
        ]
      });
    });
  });
});
