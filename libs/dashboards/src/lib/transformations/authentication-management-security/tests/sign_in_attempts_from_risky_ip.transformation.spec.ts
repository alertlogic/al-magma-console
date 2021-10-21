import { signInAttemptsFromRiskyIp } from '../sign_in_attempts_from_risky_ip.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Sign in attempts from risky IP', () => {

  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response: { rows: any[][], column_info: { type: string, name: string }[] } = {
        rows: [],
        column_info: []
      };
      const config = signInAttemptsFromRiskyIp(response);

      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are results', () => {
    it('should return a list of the Sign in attempts from risky IP', () => {
      const response: { rows: any[][], column_info: { type: string, name: string }[] } = {
        "rows": [
          [
            "Lillian Riddle",
            "Thailand",
            "216.170.120.176",
            60
          ],
          [
            "Gollapalli, Lakshmi",
            "Thailand",
            "187.148.108.167",
            30
          ]
        ],
        "column_info": [
          {
            "type": "varchar",
            "name": "user_name"
          },
          {
            "type": "varchar",
            "name": "countries"
          },
          {
            "type": "varchar",
            "name": "ips"
          },
          {
            "type": "int8",
            "name": "login_count"
          }
        ]
      };

      const config = signInAttemptsFromRiskyIp(response);
      expect(config).toEqual({
        headers: [
          { name: 'User Name', field: 'user_name', class: 'left' },
          { name: 'IP Address', field: 'ip_address', class: 'left' },
          { name: 'IP Country', field: 'ip_country', class: 'left' },
          { name: 'Login Total', field: 'login_total', class: 'right' },
        ],
        body: [
          {
            user_name: "Lillian Riddle",
            ip_address: "216.170.120.176",
            ip_country: "Thailand",
            login_total: 60
          },
          {
            user_name: "Gollapalli, Lakshmi",
            ip_address: "187.148.108.167",
            ip_country: "Thailand",
            login_total: 30
          }
        ]
      });
    });
  });
});
