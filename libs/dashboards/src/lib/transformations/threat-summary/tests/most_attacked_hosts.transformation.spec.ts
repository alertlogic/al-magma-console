import * as Transformation from '../most_attacked_hosts_iris.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Most attacked hosts', () => {

  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "count": 16978,
              "end_date": "2020-06-05T04:59:59.999Z",
              "from": 1588654800000.0,
              "start_date": "2020-05-05T05:00:00.000Z",
              "to": 1591333199999.0,
              "victims": {}
            }
          }
        },
        "results": [],
        "took": 217,
        "total": 1824701
      };

      const config = Transformation.mostAttackedHostsIris(response);
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
              "count": 16978,
              "end_date": "2020-06-05T04:59:59.999Z",
              "from": 1588654800000.0,
              "start_date": "2020-05-05T05:00:00.000Z",
              "to": 1591333199999.0,
              "victims": {
                "172.16.140.244": {
                  "asset_host_name": {
                    "N/A": {
                      "assets.al__deployment": {
                        "WLA Integration Log Source": {
                          "count": 12,
                          "incident.threatRating": {
                            "Medium": 12
                          }
                        }
                      },
                      "count": 12
                    },
                    "TestTNode": {
                      "assets.al__deployment": {
                        "WLA Integration Log Source": {
                          "count": 6,
                          "incident.threatRating": {
                            "Medium": 6
                          }
                        }
                      },
                      "count": 6
                    }
                  },
                  "count": 18
                },
                "172.31.32.29": {
                  "asset_host_name": {
                    "N/A": {
                      "assets.al__deployment": {
                        "Manual Deployment": {
                          "count": 19,
                          "incident.threatRating": {
                            "Medium": 19
                          }
                        }
                      },
                      "count": 19
                    }
                  },
                  "count": 19
                },
                "172.31.34.143": {
                  "asset_host_name": {
                    "N/A": {
                      "assets.al__deployment": {
                        "Manual Deployment": {
                          "count": 5,
                          "incident.threatRating": {
                            "Medium": 5
                          }
                        }
                      },
                      "count": 5
                    }
                  },
                  "count": 5
                },
                "172.31.35.0": {
                  "asset_host_name": {
                    "N/A": {
                      "assets.al__deployment": {
                        "Manual Deployment": {
                          "count": 36,
                          "incident.threatRating": {
                            "Medium": 36
                          }
                        },
                        "Unknown": {
                          "count": 1,
                          "incident.threatRating": {
                            "Medium": 1
                          }
                        }
                      },
                      "count": 37
                    }
                  },
                  "count": 37
                }
              }
            }
          }
        },
        "results": [
        ],
        "took": 217,
        "total": 1824701
      };

      const config = Transformation.mostAttackedHostsIris(response);
      expect(config).toEqual({
        headers: [
          { name: 'Target', field: 'targetIp', class: 'left' },
          { name: 'Host Name', field: 'host', class: 'left' },
          { name: 'Count', field: 'count', class: 'right' },
          { name: 'Deployment', field: 'deployment', class: 'left' },
          { name: 'Worst Threat Level', field: 'status', class: 'left status' },
          { name: '% of Total Attacks', field: 'percent', class: 'right' }
        ],
        body: [{
          targetIp: '172.31.35.0',
          host: 'N/A',
          count: 36,
          deployment: 'Manual Deployment',
          status: 'medium',
          percent: '0.21%',
          recordLink: {
            deployment: 'Manual Deployment',
            threat: 'Medium',
            advancedSearchQuery: `HostName = "N/A" AND DestinationIP = "172.31.35.0"`,
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          }
        },
        {
          targetIp: '172.31.32.29',
          host: 'N/A',
          count: 19,
          deployment: 'Manual Deployment',
          status: 'medium',
          percent: '0.11%',
          recordLink: {
            deployment: 'Manual Deployment',
            threat: 'Medium',
            advancedSearchQuery: `HostName = "N/A" AND DestinationIP = "172.31.32.29"`,
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          }
        },
        {
          targetIp: '172.16.140.244',
          host: 'N/A',
          count: 12,
          deployment: 'WLA Integration Log Source',
          status: 'medium',
          percent: '0.07%',
          recordLink: {
            deployment: 'WLA Integration Log Source',
            threat: 'Medium',
            advancedSearchQuery: `HostName = "N/A" AND DestinationIP = "172.16.140.244"`,
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          }
        },
        {
          targetIp: '172.16.140.244',
          host: 'TestTNode',
          count: 6,
          deployment: 'WLA Integration Log Source',
          status: 'medium',
          percent: '0.04%',
          recordLink: {
            deployment: 'WLA Integration Log Source',
            threat: 'Medium',
            advancedSearchQuery: `HostName = "TestTNode" AND DestinationIP = "172.16.140.244"`,
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          }
        },
        {
          targetIp: '172.31.34.143',
          host: 'N/A',
          count: 5,
          deployment: 'Manual Deployment',
          status: 'medium',
          percent: '0.03%',
          recordLink: {
            deployment: 'Manual Deployment',
            threat: 'Medium',
            advancedSearchQuery: `HostName = "N/A" AND DestinationIP = "172.31.34.143"`,
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          }
        },
        {
          targetIp: '172.31.35.0',
          host: 'N/A',
          count: 1,
          deployment: 'Unknown',
          status: 'medium',
          percent: '0.01%',
          recordLink: {
            deployment: 'Unknown',
            threat: 'Medium',
            advancedSearchQuery: `HostName = "N/A" AND DestinationIP = "172.31.35.0"`,
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          }
        }]
      });
    });
  });
});
