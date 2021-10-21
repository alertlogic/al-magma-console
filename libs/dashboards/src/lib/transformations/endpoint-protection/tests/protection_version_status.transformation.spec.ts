import { protectionVersionStatus } from '../protection_version_status.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { SummaryResponse, endpointResponse } from '../../tests/mocks/endpoint.mocks';

describe('Transformation Test Suite: Protection Version Status', () => {
  describe('Given a summary response', () => {
    it('Should extract thhe currency breakdown values', () => {
      const response: SummaryResponse = Object.assign({},
        endpointResponse, {
            summary: {
                currencyBreakdown:
                  {
                    current: 0,
                    outOfDate: 5
                  },
            }
      });
      expect(protectionVersionStatus(response)).toEqual({
        title: '',
        series: [{
          type: 'pie',
          name: '',
          innerSize: '50%',
          data: [{
            name: 'Up-to-date',
            y: 0,
            className: 'healthy',
            recordLink: { filter: 'UP_TO_DATE'}
          }, {
            name: 'Out-of-date',
            y: 5,
            className: 'unhealthy',
            recordLink: { filter: 'OUT_OF_DATE'}
          }]
        }],
        dataLabels: {
          style: {
            textOutline: '0px',
            color: 'white'
          }
        },
      });
    });
  });


  describe('Given that the response object count equals 0', () => {
    it('Should return a zero state object', () => {
        const response: SummaryResponse = Object.assign({},
            endpointResponse, {
                summary: {
                    currencyBreakdown:
                      {
                        current: 0,
                        outOfDate: 0
                      },
                }
          });

      expect(protectionVersionStatus(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
});
