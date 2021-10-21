import { ZeroStateReason } from '@al/ng-visualizations-components';
import { authenticationIncidentCount } from '../authentication_incident_count.transformation';

describe('Authentication management security - Incidents counts created', () => {
  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response = {
        aggregations: {
          createtime_str: {
            date_period: {
              'incident.attackClassId_str': {}
            }
          }
        },
        total: 0
      };

      const config = authenticationIncidentCount(response);
      expect(config).toEqual({ primaryCount: 0 });
    });
  });

  describe('when there are results', () => {
    let baseResponse: any = {};

    beforeEach(() => {
      baseResponse = {
        aggregations: {
          createtime_str: {
            date_period: {
              'incident.attackClassId_str': {
                "authentication:activity": 1,
                "admin:activity": 4
              }
            }
          }
        },
        total: 5
      };
    });

    it('should pass back the expected total', () => {
      const result = authenticationIncidentCount(baseResponse);
      expect(result).toEqual({ primaryCount: 5 });
    });
  });
});
