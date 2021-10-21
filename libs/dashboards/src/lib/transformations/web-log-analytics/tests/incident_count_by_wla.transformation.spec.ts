import { incidentCountCreatedByWla }  from '../incident_count_by_wla.transformaton';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Incident Count Created By WLA Transformation Test Suite:', () => {
  describe('When transforming an IRIS aggregations response', () => {
    it('should extract the total value and return an object containing a primaryCount and assign accordingly', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "count": 614,
              "end_date": "2020-05-15T04:59:59.999Z",
              "from": 1588222800000,
              "incident.threatRating": {
                "Medium": 614
              },
              "start_date": "2020-04-30T05:00:00.000Z",
              "to": 1589518799999
            }
          }
        },
        "results": [],
        "took": 100,
        "total": 860500
      };
      expect(incidentCountCreatedByWla(response)).toEqual({primaryCount: 614});
    });
    describe('with a total value of zero', () => {
      it('should reytun a ZeroState response object', () => {
        const response = {
          "aggregations": {
            "createtime_str": {
              "date_period": {
                "count": 0,
                "end_date": "2020-05-15T04:59:59.999Z",
                "from": 1588222800000,
                "incident.threatRating": {},
                "start_date": "2020-04-30T05:00:00.000Z",
                "to": 1589518799999
              }
            }
          },
          "results": [],
          "took": 100,
          "total": 860500
        };
        expect(incidentCountCreatedByWla(response)).toEqual({
          nodata: true,
          reason: ZeroStateReason.Zero
        });
      });
    });
  });
});
