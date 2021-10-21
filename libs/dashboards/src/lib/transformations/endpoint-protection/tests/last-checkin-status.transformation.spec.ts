import { lastCheckinStatus } from '../last-checkin-status.transformation';
import { endpointResponse } from '../../tests/mocks/endpoint.mocks';

describe('Transformation Test Suite: Last CheckIn Status', () => {
  it('should return 2, 3 and 5', () => {
    const obj = {
      title: "",
      yAxisType: "linear",
      dateOptions: ["Over 30 days", "Over 60 mins", "Within 60 mins"],
      series: [{
        name: "",
        showInLegend: false,
        data: [{
          name: "Over 30 days",
          y: 3,
          className: "critical",
          recordLink: {
            filter: "OVER_30_DAYS"
          }
        }, {
          name: "Over 60 mins",
          y: 5,
          className: "medium",
          recordLink: {
            filter: "OVER_60_MINUTES"
          }
        }, {
          name: "Within 60 mins",
          y: 2,
          className: "low",
          recordLink: {
            filter: "WITHIN_60_MINUTES"
          }
        }]
      }]
    };
    expect(lastCheckinStatus(endpointResponse)).toEqual(obj);
  });

});
