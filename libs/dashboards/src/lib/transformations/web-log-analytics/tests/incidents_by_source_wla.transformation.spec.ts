import * as Transformation from '../incidents_by_source_wla.transformation';

describe('WLA Incidents by Source Transformation Test Suite:', () => {
  describe('when processing a response containing cities and countries ', () => {
    it('should construct and return a correctly consrtucted Highcharts map series', () => {
      const response = {
        rows: [
          ["United States", "Dearborn", "42.3223", "-83.1763", "city", 1],
          ["United States", "", "42.3223", "-83.1763", "country", 1],
        ]
      };

      const config = Transformation.incidentsBySourceWla(response);
      expect(config).toEqual({
        cities: [{
          id: 'Dearborn',
          lat: 42.3223,
          lon: -83.1763,
          value: 1,
          className: 'source city',
          recordLink: {
            term: 'Dearborn',
            source: 'WLA',
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
        countries: [{
          id: 'United States',
          lat: 42.3223,
          lon: -83.1763,
          value: 1,
          className: 'source country',
          recordLink: {
            term: 'United States',
            source: 'WLA',
            startDate: '<start_date_time>',
            endDate: '<end_date_time>'
          },
          marker: {
            radius: '5.0'
          },
          isCountry: true
        }]
      });
    });
  });
});
