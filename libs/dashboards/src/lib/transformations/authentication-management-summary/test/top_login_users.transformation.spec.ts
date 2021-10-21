import { ZeroStateReason } from '@al/ng-visualizations-components';
import { topLoginUsers } from '../top_login_users.transformation';

describe('Transformation Test Suite: Top Login Users', () => {
  describe('Given a response', () => {
    it('should return the Top Login Users list', () => {
      const response = [
        {
          "rows": [
            [
              "0053z00000C3jeUAAR",
              175671
            ],
            [
              "Active Directory",
              62275
            ],
            [
              "HERMES SERVICE ACCOUNT USER",
              18754
            ],
            [
              "Okta LDAP Interface SERVICE ACCOUNT",
              2769
            ],
            [
              "aohagan@alazurealertlogic.onmicrosoft.com",
              2048
            ],
            [
              "testazureevents@alazurealertlogic.onmicrosoft.com",
              1356
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
          { name: 'Logins', field: 'logins', class: 'right' },
          { name: '% of Total', field: 'percentage', class: 'right' }
        ],
        body: [{
          user_name: "0053z00000C3jeUAAR",
          logins: '175671',
          percentage: '45.11%'
        },
        {
          user_name: "Active Directory",
          logins: '62275',
          percentage: '15.99%'
        },
        {
          user_name: "HERMES SERVICE ACCOUNT USER",
          logins: '18754',
          percentage: '4.82%'
        },
        {
          user_name: "Okta LDAP Interface SERVICE ACCOUNT",
          logins: '2769',
          percentage: '0.71%'
        },
        {
          user_name: "aohagan@alazurealertlogic.onmicrosoft.com",
          logins: '2048',
          percentage: '0.53%'
        },
        {
          user_name: "testazureevents@alazurealertlogic.onmicrosoft.com",
          logins: '1356',
          percentage: '0.35%'
        }]
      };

      expect(topLoginUsers(response)).toEqual(expected);
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
          "rows": [
            []
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
        nodata: true,
        reason: ZeroStateReason.Zero
      };

      expect(topLoginUsers(response)).toEqual(expected);
    });
  });
});
