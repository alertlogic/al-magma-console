import * as Transformation from '../incident_count_created.transformation';

describe('Incidents counts created', () => {
  /*
   *
   */
  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response = {
        aggregations: {
          createtime_str: {
            date_period: {
              'incident.threatRating': {}
            }
          }
        },
        total: 0
      };

      const config = Transformation.incidentCountCreated(response);
      expect(config).toEqual({
        primaryCount: 0
      });
    });
  });

  /*
   *
   */
  describe('when there are results', () => {
    let baseResponse: any = {};

    beforeEach(() => {
      baseResponse = {
        aggregations: {
          createtime_str: {
            date_period: {
              'incident.threatRating': {
                "Critical": 1,
                "High": 1,
                "Medium": 1,
                "Low": 1,
                "None": 1,
              }
            }
          }
        },
        total: 5
      };
    });

    it('should pass back the expected total', () => {
      const result = Transformation.incidentCountCreated(baseResponse);
      expect(result).toEqual({primaryCount: 5});
    });
  });
});
