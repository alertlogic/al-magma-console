import * as Transformation from '../incidents_by_target.transformation';

describe('Incidentts by source', () => {
  describe('when there are results', () => {
    it('should return a list of incidents by source', () => {
        const response = {
          rows: [
            ["Agent 1 Virginia", "", "", "", "", "United States", "Dearborn", "42.3223", "-83.1763", 1],
            ["Agent 1 Virginia", "", "", "", "", "United States", "", "42.3223", "-83.1763", 1]
          ]
        };

      const config = Transformation.incidentsByTarget(response);
      expect(config).toEqual([
        {
            id:  'Dearborn',
            lat: 42.3223,
            lon: -83.1763,
            value: 1,
            className: 'target',
            marker: {
                radius: 6
            }
        },
        {
            id:  'United States',
            lat: 42.3223,
            lon: -83.1763,
            value: 1,
            className: 'target',
            marker: {
                radius: 6
            }
        }
      ]);
    });
  });
});
