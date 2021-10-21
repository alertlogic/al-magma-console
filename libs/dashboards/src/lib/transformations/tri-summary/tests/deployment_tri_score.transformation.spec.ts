import { ZeroStateReason } from '@al/ng-visualizations-components';
import { deploymentTriScore } from '../deployment_tri_score.transformation';


describe('Transformation Test Suite: Deployment TRI Score', () => {
  describe('When a response is passed in', () => {
    it('should return the correct response object', () => {
      const response = {
        rows: [
          ['name1', 10],
          ['name2', 10]
        ]
      };

      const expected = {
        dateOptions: ['name1', 'name2'],
        description: "TRI Score",
        inverted: true,
        yAxisType: "linear",
        tooltipString: '{{name}}: {{value:2dp}}',
        series: [{
          type: "column",
          data: [
            {y: 10, className: 'al-blue-400'},
            {y: 10, className: 'al-blue-400'}
          ],
          showInLegend: false
        }]
      };

      expect(deploymentTriScore(response)).toEqual(expected);
    });
  });

  describe('When the response returns a total count of 0', () => {
    it('should return a zerostate object', () => {
      const response = {
        rows: []
      };

      const expected = {
        nodata: true,
        reason: ZeroStateReason.Zero
      };

      expect(deploymentTriScore(response)).toEqual(expected);
    });
  });
});
