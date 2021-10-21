import * as Transformation from '../firewall_connection_trends_top_applications.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { SeverityCountSummaries } from '../../kalm.named_query_response.types';
import { getLocalShortDate } from '../../transformation.utilities';

describe('Connection Trends by Top Applications Transformation Test Suite:', () => {

  const startDTA = new Date(Date.UTC(2019, 7, 12, 0, 0, 0, 0)).getTime() / 1000;
  const endDTA = new Date(Date.UTC(2019, 7, 12, 23, 59, 59, 999)).getTime() / 1000;
  const startDTB = new Date(Date.UTC(2019, 7, 13, 0, 0, 0, 0)).getTime() / 1000;
  const endDTB = new Date(Date.UTC(2019, 7, 13, 23, 59, 59, 999)).getTime() / 1000;
  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const firewallTrafficData: SeverityCountSummaries = {
        rows: [],
      };

      const config = Transformation.connectionTrendsTopApplications(firewallTrafficData);
      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
  describe('when there are results', () => {
    it('should return a correctly constructed Highcharts options object', () => {
      const firewallTrafficData: SeverityCountSummaries = {
        rows: [
          [
            "2019-08-12",
            {
                "HTTPS": 437,
                "DNS": 424,
                "SMTP": 474
            }
          ],
          [
            "2019-08-13",
            {
                "HTTPS": 600,
                "DNS": 450,
                "SMTP": 900
            }
          ]
        ]
      };

      const config = Transformation.connectionTrendsTopApplications(firewallTrafficData);
      expect(config).toEqual({
        xAxis: {
          categories: [
            getLocalShortDate(new Date('2019-08-12T00:00:00.000Z')),
            getLocalShortDate(new Date('2019-08-13T00:00:00.000Z'))
          ]
        },
        yAxis: {
          title: {
            text: 'Connections'
          }
        },
        series: [{
          name: 'HTTPS',
          data: [{
            x: 0,
            y: 437,
            recordLink: {
              application: 'HTTPS',
              startDate: startDTA,
              endDate: endDTA
            }
          },{
            x: 1,
            y: 600,
            recordLink: {
              application: 'HTTPS',
              startDate: startDTB,
              endDate: endDTB
            }
          }],
          className: 'al-amber-500',
          type: 'area'
        },{
          name: 'DNS',
          data: [{
            x: 0,
            y: 424,
            recordLink: {
              application: 'DNS',
              startDate: startDTA,
              endDate: endDTA
            }
          },{
            x: 1,
            y: 450,
            recordLink: {
              application: 'DNS',
              startDate: startDTB,
              endDate: endDTB
            }
          }],
          className: 'al-blue-500',
          type: 'area'
        },{
          name: 'SMTP',
          data: [{
            x: 0,
            y: 474,
            recordLink: {
              application: 'SMTP',
              startDate: startDTA,
              endDate: endDTA
            }
          },{
            x: 1,
            y: 900,
            recordLink: {
              application: 'SMTP',
              startDate: startDTB,
              endDate: endDTB
            }
          }],
          className: 'al-gray-500',
          type: 'area'
        }],
        legend: {
          reversed: true
        }
      });
    });
  });
});
