import { protectionStatus } from '../protection_status.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { SummaryResponse, endpointResponse } from '../../tests/mocks/endpoint.mocks';

describe('Transformation Test Suite: Protection Status', () => {
  describe('Given a summary response containing non zero count values in the state breakdown', () => {
    describe('with primaryState values set for OFF, ERROR and ON states', () => {
      const response: SummaryResponse = Object.assign({},
        endpointResponse, {
          summary: {
            stateBreakdown: {
              primaryState: {
                INSTALLING: 0,
                ARCHIVED: 0,
                INACTIVE: 0,
                OFF: 2,
                ERROR: 1,
                ON: 5
              },
              secondaryState: {
                INACTIVE_WITH_STATUS_ON: 0,
                INACTIVE_WITH_STATUS_OFF: 0
              }
            }
          }
      });
      it('Should extract these and use to construct a suitable pie chart series config', () => {
        expect(protectionStatus(response)).toEqual({
          title: '',
          series: [{
            type: 'pie',
            name: '',
            innerSize: '50%',
            data: [{
              name: 'On',
              y: 5,
              className: 'al-green-500',
              recordLink: { filter: 'PROTECTION_ON'}
            }, {
                name: 'Error',
                y: 1,
                className: 'al-orange-500',
                recordLink: { filter: 'ERRORS'}
            }, {
                name: 'Off',
                y: 2,
                className: 'al-red-500',
                recordLink: { filter: 'PROTECTION_OFF'}
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
      describe('with primaryState values set for OFF, ERROR and ON states', () => {
        it('Should extract these and use to construct a suitable pie chart series config', () => {
          response.summary.stateBreakdown.secondaryState.INACTIVE_WITH_STATUS_OFF = 1;
          response.summary.stateBreakdown.secondaryState.INACTIVE_WITH_STATUS_ON = 1;
          expect(protectionStatus(response)).toEqual({
            title: '',
            series: [{
              type: 'pie',
              name: '',
              innerSize: '50%',
              data: [{
                name: 'On',
                y: 6,
                className: 'al-green-500',
                recordLink: { filter: 'PROTECTION_ON'}
              }, {
                  name: 'Error',
                  y: 1,
                  className: 'al-orange-500',
                  recordLink: { filter: 'ERRORS'}
              }, {
                  name: 'Off',
                  y: 3,
                  className: 'al-red-500',
                  recordLink: { filter: 'PROTECTION_OFF'}
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
    });
  });


  describe('Given a summary response containing all zero count values in the state breakdown', () => {
    it('Should return a zero state object', () => {
        const response: SummaryResponse = Object.assign({},
            endpointResponse, {
              summary: {
                stateBreakdown: {
                  primaryState: {
                    INSTALLING: 0,
                    ARCHIVED: 0,
                    INACTIVE: 0,
                    OFF: 0,
                    ERROR: 0,
                    ON: 0
                  },
                  secondaryState: {
                    INACTIVE_WITH_STATUS_ON: 0,
                    INACTIVE_WITH_STATUS_OFF: 0
                  }
                }
              }
          });

      expect(protectionStatus(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
});
