import { topAttackersByOccurrenceWla } from '../top_attackers_by_wla.transformation';
import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';

describe('Top Attackers By Occurrence Transformation Test Suite:', () => {

  describe('when there are zero results returned', () => {
    it('should return a zero state reason for no results', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "attackers": {
              },
              "count": 3291,
              "end_date": "2020-05-19T04:59:59.999Z",
              "from": 1588568400000.0,
              "start_date": "2020-05-04T05:00:00.000Z",
              "to": 1589864399999.0
            }
          }
        },
        "results": [],
        "took": 168,
        "total": 864102
      };
      expect(topAttackersByOccurrenceWla(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are multiple results', () => {
    it('should return a list of the most attacked hosts sorted by country name and then by count in descending order', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "attackers": {
                "0.81.82.8": {
                  "attacker_country_name": {
                    "N/A": 10
                  },
                  "count": 10
                },
                "181.174.166.164": {
                  "attacker_country_name": {
                    "N/A": 56,
                    "Panama": 253
                  },
                  "count": 309
                },
                "31.52.18.5": {
                  "attacker_country_name": {
                    "United Kingdom": 7
                  },
                  "count": 7
                },
                "63.234.249.38": {
                  "attacker_country_name": {
                    "United States": 17
                  },
                  "count": 17
                },
                "72.249.194.216": {
                  "attacker_country_name": {
                    "United States": 18
                  },
                  "count": 18
                }
              },
              "count": 3291,
              "end_date": "2020-05-19T04:59:59.999Z",
              "from": 1588568400000.0,
              "start_date": "2020-05-04T05:00:00.000Z",
              "to": 1589864399999.0
            }
          }
        },
        "results": [],
        "took": 168,
        "total": 864102
      };

      expect(topAttackersByOccurrenceWla(response)).toEqual({
        headers: [
          { name: 'Attacker', field: 'ip', class: 'left' },
          { name: 'Count', field: 'count', class: 'right' },
          { name: 'Location', field: 'location', class: 'left' },
        ],
        body: [
          {
            ip: '181.174.166.164',
            count: 253,
            location: 'Panama',
            recordLink: {
              advancedSearchQuery: "SourceIP = '181.174.166.164' AND AttackerCountryName = 'Panama'",
              source: 'WLA',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          },
          {
            ip: '181.174.166.164',
            count: 56,
            location: 'N/A',
            recordLink: {
              advancedSearchQuery: "SourceIP = '181.174.166.164' AND AttackerCountryName = 'N/A'",
              source: 'WLA',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          },
          {
            ip: '72.249.194.216',
            count: 18,
            location: 'United States',
            recordLink: {
              advancedSearchQuery: "SourceIP = '72.249.194.216' AND AttackerCountryName = 'United States'",
              source: 'WLA',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          },
          {
            ip: '63.234.249.38',
            count: 17,
            location: 'United States',
            recordLink: {
              advancedSearchQuery: "SourceIP = '63.234.249.38' AND AttackerCountryName = 'United States'",
              source: 'WLA',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          },
          {
            ip: '0.81.82.8',
            count: 10,
            location: 'N/A',
            recordLink: {
              advancedSearchQuery: "SourceIP = '0.81.82.8' AND AttackerCountryName = 'N/A'",
              source: 'WLA',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          },
          {
            ip: '31.52.18.5',
            count: 7,
            location: 'United Kingdom',
            recordLink: {
              advancedSearchQuery: "SourceIP = '31.52.18.5' AND AttackerCountryName = 'United Kingdom'",
              source: 'WLA',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          }
        ]
      });
    });
  });
});
