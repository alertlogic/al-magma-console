import * as Transformation from '../incidents_by_source.transformation';

describe('Incidentts by source', () => {
  describe('when there are results', () => {
    it('should return a list of incidents by source', () => {
        const response = {
          rows: [
            ["United States", "Dearborn", "42.3223", "-83.1763", "city", 1],
            ["United States", "", "42.3223", "-83.1763", "country", 1]
          ]
        };

      const config = Transformation.incidentsBySource(response);
      expect(config).toEqual({
          cities: [
            {
                id:  'Dearborn',
                lat: 42.3223,
                lon: -83.1763,
                value: 1,
                className: 'source city',
                recordLink: {
                  term: 'Dearborn',
                  startDate: '<start_date_time>',
                  endDate: '<end_date_time>'
              },
                marker: {
                    radius: '5.0',
                    symbol: 'circle'
                },
                isCountry: false
            }
          ],
          countries: [
            {
                id:  'United States',
                lat: 42.3223,
                lon: -83.1763,
                value: 1,
                className: 'source country',
                recordLink: {
                  term: 'United States',
                  startDate: '<start_date_time>',
                  endDate: '<end_date_time>'
              },
                marker: {
                    radius: '5.0'
                },
                isCountry: true
            }
          ]
      });
    });
  });
});
