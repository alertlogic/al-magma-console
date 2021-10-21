import { firewallLogVolume } from '../firewall_log_volume.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Firewall Log Volume Transformation Test Suite:', () => {
  describe('When transforming a kalm response containing firewall log trend data', () => {
    it('should generate and return a correctly constructed Highcharts series object', () => {
      const response = {
        rows: [
          ["2020-03-02", 100, 200, 300],
          ["2020-03-03", 200, 100, 500]
        ]
      };
      expect(firewallLogVolume(response)).toEqual({
        series: [{
          data: [{
            name: "Messages",
            y: 70,
            value: 200,
            className: "al-gray-500"
          }, {
            name: "Observations",
            y: 20,
            value: 100,
            className: "al-blue-500"
          }, {
            name: "Incidents",
            y: 10,
            value: 500,
            className: "al-purple-500"
          }],
          name: 'Firewall Log Volume',
          showInLegend: true
        }]
      });
    });
  });
  describe('When transforming a kalm response containing firewall log trend data with zero observations', () => {
    it('should generate and return a correctly constructed Highcharts series object', () => {
      const response = {
        rows: [
          ["2020-03-02", 100, 0, 300],
          ["2020-03-03", 200, 0, 500]
        ]
      };
      expect(firewallLogVolume(response)).toEqual({
        series: [{
          data: [{
            name: "Messages",
            y: 70,
            value: 200,
            className: "al-gray-500"
          }, {
            name: "Incidents",
            y: 30,
            value: 500,
            className: "al-purple-500"
          }],
          name: 'Firewall Log Volume',
          showInLegend: true
        }]
      });
    });
  });
  describe('When transforming a kalm response containing firewall log trend data with zero incidents', () => {
    it('should generate and return a correctly constructed Highcharts series object', () => {
      const response = {
        rows: [
          ["2020-03-02", 100, 0, 300],
          ["2020-03-03", 200, 200, 0]
        ]
      };
      expect(firewallLogVolume(response)).toEqual({
        series: [{
          data: [{
            name: "Messages",
            y: 70,
            value: 200,
            className: "al-gray-500"
          }, {
            name: "Observations",
            y: 30,
            value: 200,
            className: "al-blue-500"
          }],
          name: 'Firewall Log Volume',
          showInLegend: true
        }]
      });
    });
  });
  describe('When transforming a kalm response containing zero rows', () => {
    it('should generate aand return a ZeroState response object', () => {
      const response = {
        rows: []
      };
      expect(firewallLogVolume(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
  describe('When transforming a kalm response containing  firewall log trend data but with zero counts throughout', () => {
    it('should generate aand return a ZeroState response object', () => {
      const response = {
        rows: [
          ["2020-03-02", 100, 200, 300],
          ["2020-03-03", 0, 0, 0]
        ]
      };
      expect(firewallLogVolume(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
});
