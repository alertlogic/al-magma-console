import * as Transformation from '../most-attacked-users.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { SummaryResponse, endpointResponse } from '../../tests/mocks/endpoint.mocks';

describe('Most Attacked Users Transformation Test Suite', () => {

  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response: SummaryResponse = Object.assign({},
        endpointResponse, {
        summary: {
          usersWithIncidents: []
        }
      });

      const config = Transformation.mostAttackedUsers(response);
      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
  describe('when there are results', () => {
    it('should return a correctly constructred table list configuration object', () => {
      const response: SummaryResponse = Object.assign({},
        endpointResponse, {
        summary: {
          usersWithIncidents: [{
            username: 'John Smith',
            protectCount: 80,
            monitoredCount: 0
          },{
            username: 'Sally Robinson',
            protectCount: 20,
            monitoredCount: 0
          }]
        }
      });

      const config = Transformation.mostAttackedUsers(response);
      expect(config).toEqual({
        headers: [
          { name: 'User Name', field: 'username', class: 'left' },
          { name: 'Event Count', field: 'count', class: 'right' },
          { name: '% of Total', field: 'percent', class: 'right' }
        ],
        body: [{
          username: 'John Smith',
          count: 80,
          percent: '80%',
          recordLink: {
            search: 'John Smith'
          }
        },{
          username: 'Sally Robinson',
          count: 20,
          percent: '20%',
          recordLink: {
            search: 'Sally Robinson'
          }
        }]
      });
    });
  });
});
