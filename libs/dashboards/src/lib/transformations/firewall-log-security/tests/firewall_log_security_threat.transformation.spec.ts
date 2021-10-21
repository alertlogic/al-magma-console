import { firewallSecurityIncidentThreat } from '../firewall_log_security_threat.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Firewall Log Security Threat Transformation Test Suite:', () => {
  describe('When transforming a kalm response containing severity count entries', () => {
    it('should generate a correctly constructed Highchart series configuration object', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "count": 50,
              "end_date": "2020-06-13T04:59:59.687Z",
              "from": 1589346000687,
              "incident.threatRating": {
                "Medium": 150,
                "Critical": 50
              },
              "start_date": "2020-05-13T05:00:00.687Z",
              "to": 1592024399687
            }
          }
        }
      };
      expect(firewallSecurityIncidentThreat(response)).toEqual({
        series: [{
          data: [{
            className: 'critical',
            name: 'Critical',
            value: 50,
            y: 50,
            recordLink: {
              threat: 'Critical',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          },{
            className: 'low',
            name: 'Medium',
            value: 150,
            y: 150,
            recordLink: {
              threat: 'Medium',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          }]
        }]
      });
    });
  });
  describe('When transforming a kalm response containing zero rows', () => {
    it('should generate aand return a ZeroState response object', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "count": 50,
              "end_date": "2020-06-13T04:59:59.687Z",
              "from": 1589346000687,
              "incident.threatRating": {},
              "start_date": "2020-05-13T05:00:00.687Z",
              "to": 1592024399687
            }
          }
        }
      };
      expect(firewallSecurityIncidentThreat(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
});
