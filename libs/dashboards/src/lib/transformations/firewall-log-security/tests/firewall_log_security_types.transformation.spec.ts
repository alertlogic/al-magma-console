import { firewallSecurityIncidentTypes } from '../firewall_log_security_types.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Firewall Log Security Types Transformation Test Suite:', () => {
  describe('When transforming a kalm response containing log security incident types entries', () => {
    it('should generate a correctly constructed Highchart series configuration object', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "count": 48,
              "end_date": "2020-06-15T04:59:59.103Z",
              "from": 1589518800103,
              "incident.attackClassId_str": {
                "suspicious-activity": 48,
                "application-attack": 100
              },
              "start_date": "2020-05-15T05:00:00.103Z",
              "to": 1592197199103
            }
          }
        }
      };
      expect(firewallSecurityIncidentTypes(response)).toEqual({
        title: '',
        description: 'Count of Incidents',
        dateOptions: ['suspicious-activity', 'application-attack'],
        inverted: true,
        yAxisType: 'linear',
        series: [{
          type: 'column',
          showInLegend: false,
          data: [{
            y: 48,
            className: 'al-blue-400',
            recordLink: {
              category: 'suspicious-activity',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          },
          {
            y: 100,
            className: 'al-blue-400',
            recordLink: {
              category: 'application-attack',
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
              "count": 48,
              "end_date": "2020-06-15T04:59:59.103Z",
              "from": 1589518800103,
              "incident.attackClassId_str": {},
              "start_date": "2020-05-15T05:00:00.103Z",
              "to": 1592197199103
            }
          }
        }
      };
      expect(firewallSecurityIncidentTypes(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
});
