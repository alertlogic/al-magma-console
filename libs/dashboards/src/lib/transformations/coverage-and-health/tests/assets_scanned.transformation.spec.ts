import { assetsScanned } from '../assets_scanned_status.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';

describe('Transformation Test Suite: Assets Scanned', () => {
  describe('Given an Assets Scanned response object', () => {
    it('should extract the agent health scores for use in a correctly formatted chart config', () => {
      const responses = [{
        assets: [
          [200]
        ]
      },{
        assets: [
          [150]
        ]
      }];
      expect(assetsScanned(responses)).toEqual({
        title: '',
        series: [{
          type: 'pie',
          name: '',
          innerSize: '50%',
          data: [{
            name: 'Scanned',
            y: 150,
            className: 'scanned'
          }, {
            name: 'Not Scanned',
            y: 50,
            className: 'not-scanned'
          }]
        }],
        dataLabels: {
          style: {
            textOutline: '0px',
            color: 'white'
          }
        }
      });
    });
  });
  describe('Given that the response object count equals 0', () => {
    it('Should return a zero state object', () => {
      const responses = [{
        assets: [
          [0]
        ]
      },{
        assets: [
          [0]
        ]
      }];
      expect(assetsScanned(responses)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
});
