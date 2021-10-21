import { ZeroStateReason } from '@al/ng-visualizations-components';
import { vpcTriScore } from '../vpc_tri_score.transformation';

describe('Transformation Test Suite: VPC Tri Score', () => {
  describe('When a response is passed in that has a value greater than 0', () => {
    it('should return the correct response object', () => {
      const response = {
        rows: [
          ['name1', 5],
          ['name2', 10]
        ]
      };
      const expected = {
        dateOptions: ['name1', 'name2'],
        description: 'TRI Score',
        inverted: true,
        yAxisType: 'linear',
        tooltipString: '{{name}}: {{value:2dp}}',
        series: [
          {
            type: 'column',
            data: [
              {y: 5, className: 'al-blue-400'},
              {y: 10, className: 'al-blue-400'}
            ],
            showInLegend: false
          }
        ]
      };

      expect(vpcTriScore(response)).toEqual(expected);
    });
  });

  describe('When a response is passed in that has a value equal 0', () => {
    it('should return the a zero state object', () => {
      const response = {rows: []};
      const expected = {
        nodata: true,
        reason: ZeroStateReason.Zero
      };

      expect(vpcTriScore(response)).toEqual(expected);
    });
  });
});
