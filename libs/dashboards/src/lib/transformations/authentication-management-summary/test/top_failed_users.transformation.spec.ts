import { ZeroStateReason } from '@al/ng-visualizations-components';
import { topFailedLoginUsers } from '../top_failed_login_users.transformation';

describe('Transformation Test Suite: Top Failed Login Users', () => {
  describe('Given a response', () => {
    it('should return the Top Login Users list', () => {
      const response = [
        {
          "rows": [
            [
              "Active Directory",
              5725
            ],
            [
              "azure_valid@alazurealertlogic.onmicrosoft.com",
              5492
            ],
            [
              "unknown",
              3746
            ],
            [
              "azure_se_logcollection@alazurealertlogic.onmicrosoft.com",
              1216
            ],
            [
              "aohagan@alazurealertlogic.onmicrosoft.com",
              1208
            ]
          ],
          "column_info": [
            {
              "type": "varchar",
              "name": "user_name"
            },
            {
              "type": "int8",
              "name": "login_count"
            }
          ]
        },
        {
          "rows": [
            [
              389415,
              36034
            ]
          ],
          "column_info": [
            {
              "type": "int8",
              "name": "successful_login_count"
            },
            {
              "type": "int8",
              "name": "failed_login_count"
            }
          ]
        }
      ];

      const expected = {
        headers: [
          { name: 'User Name', field: 'user_name', class: 'left' },
          { name: 'Failed Logins', field: 'logins', class: 'right' },
          { name: '% of Total', field: 'percentage', class: 'right' }
        ],
        body: [{
          user_name: "Active Directory",
          logins: '5725',
          percentage: '15.89%'
        },
        {
          user_name: "azure_valid@alazurealertlogic.onmicrosoft.com",
          logins: '5492',
          percentage: '15.24%'
        },
        {
          user_name: "unknown",
          logins: '3746',
          percentage: '10.40%'
        },
        {
          user_name: "azure_se_logcollection@alazurealertlogic.onmicrosoft.com",
          logins: '1216',
          percentage: '3.37%'
        },
        {
          user_name: "aohagan@alazurealertlogic.onmicrosoft.com",
          logins: '1208',
          percentage: '3.35%'
        }]
      };

      expect(topFailedLoginUsers(response)).toEqual(expected);
    });
  });
  describe('When a response is passed in that has a value equal 0', () => {
    it('should return the a zero state object', () => {
      const response = [
        {
          "rows": [],
          "column_info": [
            {
              "type": "varchar",
              "name": "user_name"
            },
            {
              "type": "int8",
              "name": "login_count"
            }
          ]
        },
        {
          "rows": [],
          "column_info": [
            {
              "type": "int8",
              "name": "successful_login_count"
            },
            {
              "type": "int8",
              "name": "failed_login_count"
            }
          ]
        }
      ];

      const expected = {
        nodata: true,
        reason: ZeroStateReason.Zero
      };

      expect(topFailedLoginUsers(response)).toEqual(expected);
    });
  });
});
