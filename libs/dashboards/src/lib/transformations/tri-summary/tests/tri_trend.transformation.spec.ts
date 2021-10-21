import { ZeroStateReason } from '@al/ng-visualizations-components';
import { triTrend } from '../tri_trend.transformation';
import { getLocalShortDate } from '../../transformation.utilities';

describe('Transformation Test Suite: TRI Trend', () => {
  describe('When a response is passed in that has a value greater than 0', () => {
    it('should return the correct response object', () => {
      const response = {
        rows: [
          ["2020-04-02", 5],
          ["2020-04-02", 5]
        ]
      };
      const expected = {
        dateOptions: [getLocalShortDate(new Date('2020-04-02T00:00:00.000Z')), getLocalShortDate(new Date('2020-04-02T00:00:00.000Z'))],
        description: 'Overall TRI Score',
        tooltipString: '{{name}}: {{value:2dp}}',
        series: [
          {
            name: 'Overall TRI Score',
            data: [
              {x: 0, y: 5},
              {x: 1, y: 5}
            ],
            showInLegend: false
          }
        ]
      };

      expect(triTrend(response)).toEqual(expected);
    });
  });

  describe('When a response is passed in that has rows but the count is 0', () => {
    it('should return the correct response object with empty series data', () => {
      const response = {
        rows: [
          ["2020-04-02", 0],
          ["2020-04-02", 0]
        ]
      };
      const expected = {
        dateOptions: [getLocalShortDate(new Date('2020-04-02T00:00:00.000Z')), getLocalShortDate(new Date('2020-04-02T00:00:00.000Z'))],
        description: 'Overall TRI Score',
        tooltipString: '{{name}}: {{value:2dp}}',
        series: []
      };

      expect(triTrend(response)).toEqual(expected);
    });
  });

  describe('When a response is passed in that has a value equal 0', () => {
    it('should return the a zero state object', () => {
      const response = {rows: []};
      const expected = {
        nodata: true,
        reason: ZeroStateReason.Zero
      };

      expect(triTrend(response)).toEqual(expected);
    });
  });
});
