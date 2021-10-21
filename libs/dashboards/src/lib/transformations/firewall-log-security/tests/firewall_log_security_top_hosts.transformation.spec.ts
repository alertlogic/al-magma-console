import { firewallSecurityTopHosts } from '../firewall_log_security_top_hosts.transformation';
import { TableListConfig } from '@al/ng-visualizations-components';


describe('Firewall Log Security Top hosts Transformation Test Suite:', () => {
  describe('When transforming a kalm response containing host with firewall incidents entries', () => {
    it('should generate a correctly constructed TableListConfig object', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "attackers": {
                "149.242.43.11": 7,
                "166.183.172.233": 10,
                "178.253.38.30": 1,
                "181.174.166.164": 31,
              },
              "count": 50,
              "end_date": "2020-06-13T04:59:59.972Z",
              "from": 1589346000972,
              "start_date": "2020-05-13T05:00:00.972Z",
              "to": 1592024399972
            }
          }
        }
      };
      expect(firewallSecurityTopHosts(response)).toEqual({
        headers: [{
          name: "Source",
          field: "source",
          class: "left"
        },
        {
          name: "Incidents",
          field: "incidents",
          class: "right"
        }],
        body: [{
          source: "181.174.166.164",
          incidents: 31,
          recordLink: {
            advancedSearchQuery: `SourceIP = "181.174.166.164"`,
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          }
        },
        {
          source: "166.183.172.233",
          incidents: 10,
          recordLink: {
            advancedSearchQuery: `SourceIP = "166.183.172.233"`,
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          }
        },
        {
          source: "149.242.43.11",
          incidents: 7,
          recordLink: {
            advancedSearchQuery: `SourceIP = "149.242.43.11"`,
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          }
        },
        {
          source: "178.253.38.30",
          incidents: 1,
          recordLink: {
            advancedSearchQuery: `SourceIP = "178.253.38.30"`,
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          }
        }]
      } as TableListConfig);
    });
  });
});
