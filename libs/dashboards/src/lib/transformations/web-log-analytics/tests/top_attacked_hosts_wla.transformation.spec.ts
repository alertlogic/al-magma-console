import * as Transformation from '../top_attacked_hosts_wla.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Most attacked hosts', () => {

  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "count": 4352,
              "end_date": "2020-05-23T23:59:59.999Z",
              "from": 1588568400000.0,
              "start_date": "2020-05-04T05:00:00.000Z",
              "to": 1590278399999.0,
              "victim_any": {}
            }
          }
        },
        "results": [],
        "took": 176,
        "total": 1160613
      };

      const config = Transformation.mostAttackedHostsByWla(response);
      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
  describe('when there are results', () => {
    it('should return a list of the most attacked hosts', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "count": 4352,
              "end_date": "2020-05-23T23:59:59.999Z",
              "from": 1588568400000.0,
              "start_date": "2020-05-04T05:00:00.000Z",
              "to": 1590278399999.0,
              "victim_any": {
                "10.110.18.200": {
                  "asset_host_name": {
                    "N/A": {
                      "attackers": {
                        "181.174.166.164": {
                          "count": 1,
                          "incident.attackClassId_str": {
                            "suspicious-activity": 1
                          }
                        }
                      },
                      "count": 1
                    }
                  },
                  "count": 1
                },
                "172.16.140.244": {
                  "asset_host_name": {
                    "N/A": {
                      "attackers": {
                        "181.174.166.164": {
                          "count": 12,
                          "incident.attackClassId_str": {
                            "suspicious-activity": 12
                          }
                        }
                      },
                      "count": 12
                    },
                    "TestTNode": {
                      "attackers": {
                        "181.174.166.164": {
                          "count": 5,
                          "incident.attackClassId_str": {
                            "suspicious-activity": 5
                          }
                        }
                      },
                      "count": 5
                    }
                  },
                  "count": 17
                },
                "192.168.1.1": {
                  "asset_host_name": {
                    "N/A": {
                      "attackers": {
                        "181.174.166.164": {
                          "count": 1,
                          "incident.attackClassId_str": {
                            "suspicious-activity": 1
                          }
                        }
                      },
                      "count": 1
                    }
                  },
                  "count": 1
                }
              }
            }
          }
        },
        "results": [],
        "took": 176,
        "total": 1160613
      };

      const config = Transformation.mostAttackedHostsByWla(response);
      expect(config).toEqual({
        headers: [
          { name: 'Host/VHost', field: 'targetIp', class: 'left' },
          { name: 'Host Name', field: 'host', class: 'left' },
          { name: 'Attack Class', field: 'attackClass', class: 'left' },
          { name: 'Attacker IP', field: 'attackerIp', class: 'left' },
          { name: 'Count', field: 'count', class: 'right' },
          { name: '% of Total', field: 'percent', class: 'right' }
        ],
        body: [{
            targetIp: '172.16.140.244',
            host: 'N/A',
            attackClass: 'suspicious-activity',
            attackerIp: '181.174.166.164',
            count: 12,
            recordLink: {
              category: 'suspicious-activity',
              advancedSearchQuery: `Destination = "172.16.140.244" AND HostName = "N/A" AND SourceIP = "181.174.166.164"`,
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            },
            percent: '0.28%'
          },
          {
            targetIp: '172.16.140.244',
            host: 'TestTNode',
            attackClass: 'suspicious-activity',
            attackerIp: '181.174.166.164',
            count: 5,
            recordLink: {
              category: 'suspicious-activity',
              advancedSearchQuery: `Destination = "172.16.140.244" AND HostName = "TestTNode" AND SourceIP = "181.174.166.164"`,
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            },
            percent: '0.11%'
          },
          {
            targetIp: '10.110.18.200',
            host: 'N/A',
            attackClass: 'suspicious-activity',
            attackerIp: '181.174.166.164',
            count: 1,
            recordLink: {
              category: 'suspicious-activity',
              advancedSearchQuery: `Destination = "10.110.18.200" AND HostName = "N/A" AND SourceIP = "181.174.166.164"`,
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            },
            percent: '0.02%'
        },
        {
          targetIp: '192.168.1.1',
          host: 'N/A',
          attackClass: 'suspicious-activity',
          attackerIp: '181.174.166.164',
          count: 1,
          recordLink: {
            category: 'suspicious-activity',
            advancedSearchQuery: `Destination = "192.168.1.1" AND HostName = "N/A" AND SourceIP = "181.174.166.164"`,
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          },
          percent: '0.02%'
        }]
      });
    });
  });
});
