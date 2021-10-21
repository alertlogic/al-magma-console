import * as Transformation from '../incident_distribution.transformation';

describe('Per Incident Classification Comparison', () => {
  describe('when there are results', () => {
    it('should return a list of incidents by source', () => {
        const rows:(string|number)[][] = [
          ["brute-force", 8, 3, 438, 2],
          ["brute-force", 8, 3, 42452, 5],
          ["brute-force", 8, 3, 196, 1],
          ["brute-force", 8, 3, 3483, 4],
          ["brute-force", 8, 3, 1046, 3]
        ];
        const response = {
          rows,
          column_info: [{
            type: 'varchar',
            name: 'incident_attack_class'
          }, {
            type: 'int4',
            name: 'account_incident_count'
          }, {
            type: 'int4',
            name: 'account_quintile'
          }, {
            type: 'int4',
            name: 'incident_count'
          }, {
            type: 'int4',
            name: 'quitile'
          }]
        };

      const config = Transformation.incidentDistribution(response);
      expect(config).toEqual({
        title: '',
        stacking: 'percent',
        yAxisType: 'linear',
        dateOptions: ['brute-force'],
        series: [{
          name: 'Top 20%',
          data: [42452],
          className: 'al-red-900'
        }, {
          name: '2nd 20%',
          data: [3483],
          className: 'al-red-600'
        }, {
          name: 'Middle 20%',
          data: [1046],
          className: 'al-red-300'
        }, {
          name: '4th 20%',
          data: [438],
          className: 'al-gray-500'
        }, {
          name: 'Bottom 20%',
          data: [196],
          className: 'al-gray-300'
        }, {
          type: 'line',
          name: 'Your ranking',
          data: [2]
        }]
      });
    });
  });
});
