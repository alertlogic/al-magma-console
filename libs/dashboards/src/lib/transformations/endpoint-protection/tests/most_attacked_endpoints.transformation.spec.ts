import * as Transformation from '../most-attacked-endpoints.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { SummaryResponse, endpointResponse } from '../../tests/mocks/endpoint.mocks';

describe('Most Attacked Endpoints Transformation Test Suite', () => {

  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response: SummaryResponse = Object.assign({},
        endpointResponse, {
        summary: {
          endpointsWithIncidents: []
        }
      });

      const config = Transformation.mostAttackedEndpoints(response);
      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
  describe('when there are results', () => {
    it('should return a correctly constructed table list configuration object', () => {
      const response: SummaryResponse = Object.assign({},
        endpointResponse, {
        summary: {
          endpointsWithIncidents: [{
            endpointName: 'WIN-PEN1IOGOCO9',
            protectCount: 80,
            monitoredCount: 0
          },{
            endpointName: 'WIN-PEN1IOXYC22',
            protectCount: 20,
            monitoredCount: 0
          }]
        }
      });

      const config = Transformation.mostAttackedEndpoints(response);
      expect(config).toEqual({
        headers: [
          { name: 'Endpoint Name', field: 'endpoint', class: 'left multiline-content' },
          { name: 'Event Count', field: 'count', class: 'right' },
          { name: '% of Total', field: 'percent', class: 'right' }
        ],
        body: [{
          endpoint: 'WIN-PEN1IOGOCO9',
          count: 80,
          percent: '80%',
          recordLink: {
            search: 'WIN-PEN1IOGOCO9'
          }
        },{
          endpoint: 'WIN-PEN1IOXYC22',
          count: 20,
          percent: '20%',
          recordLink: {
            search: 'WIN-PEN1IOXYC22'
          }
        }]
      });
    });
  });
});
