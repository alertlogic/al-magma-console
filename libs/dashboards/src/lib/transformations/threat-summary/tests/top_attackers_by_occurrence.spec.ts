import * as Transformation from '../top_attackers_by_occurrence_iris';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Top Attackers By Occurrence', () => {

  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "attackers": {},
              "count": 3395,
              "end_date": "2020-06-15T04:59:59.999Z",
              "from": 1590901200000,
              "start_date": "2020-05-31T05:00:00.000Z",
              "to": 1592197199999
            }
          }
        }
      };
      const config = Transformation.topAttackersByOccurrenceIris(response);

      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are results', () => {
    it('should return a list of the most attacked hosts', () => {
      const response = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "attackers": {
                "181.174.166.164": {
                  "attacker_country_name": {
                    "Panama": 1268
                  },
                  "count": 1268
                },
                "204.93.62.94": {
                  "attacker_country_name": {
                    "United States": 27
                  },
                  "count": 27
                },
                "209.95.131.214": {
                  "attacker_country_name": {
                    "United States": 26
                  },
                  "count": 26
                },
                "63.116.246.196": {
                  "attacker_country_name": {
                    "United Kingdom": 21
                  },
                  "count": 21
                },
                "63.234.249.38": {
                  "attacker_country_name": {
                    "United States": 37
                  },
                  "count": 37
                }
              },
              "count": 3395,
              "end_date": "2020-06-15T04:59:59.999Z",
              "from": 1590901200000,
              "start_date": "2020-05-31T05:00:00.000Z",
              "to": 1592197199999
            }
          }
        }
      };

      const config = Transformation.topAttackersByOccurrenceIris(response);
      expect(config).toEqual({
        headers: [
          { name: 'Attacker', field: 'ip', class: 'left' },
          { name: 'Count', field: 'count', class: 'right' },
          { name: 'Location', field: 'location', class: 'left' },
        ],
        body: [
          {
            ip: '181.174.166.164',
            count: 1268,
            location: 'Panama',
            recordLink: {
              advancedSearchQuery: 'SourceIP = "181.174.166.164" AND AttackerCountryName = "Panama"',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          },
          {
            ip: '63.234.249.38',
            count: 37,
            location: 'United States',
            recordLink: {
              advancedSearchQuery: 'SourceIP = "63.234.249.38" AND AttackerCountryName = "United States"',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          },
          {
            ip: '204.93.62.94',
            count: 27,
            location: 'United States',
            recordLink: {
              advancedSearchQuery: 'SourceIP = "204.93.62.94" AND AttackerCountryName = "United States"',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          },
          {
            ip: '209.95.131.214',
            count: 26,
            location: 'United States',
            recordLink: {
              advancedSearchQuery: 'SourceIP = "209.95.131.214" AND AttackerCountryName = "United States"',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          },
          {
            ip: '63.116.246.196',
            count: 21,
            location: 'United Kingdom',
            recordLink: {
              advancedSearchQuery: 'SourceIP = "63.116.246.196" AND AttackerCountryName = "United Kingdom"',
              startDate: '<start_date_time>',
              endDate: '<end_date_time>'
            }
          }
        ]
      });
    });
  });
});
