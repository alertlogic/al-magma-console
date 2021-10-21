import { protectionPlatforms } from '../protection.platforms.transformation';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { SummaryResponse, endpointResponse } from '../../tests/mocks/endpoint.mocks';

describe('Transformation Test Suite: Endpoints Protection Platforms', () => {
  describe('Given a summary response containing an osBreakdown with Windows and Mac endpoint entries', () => {
    it('should build column chart config with a Windows and Mac series', () => {
      const response: SummaryResponse = Object.assign({},
        endpointResponse, {
          summary: {
            osBreakdown: [{
              os: 'Windows',
              versions: [{
                osName: 'Windows 7',
                osVersion: "",
                count: 2
              },{
                osName: 'Windows 10',
                osVersion: "",
                count: 1
              }]

            },{
              os: 'Apple',
              versions: [{
                osName: 'Mac OS X',
                osVersion: "",
                count: 4
              }]
            }]
          }
      });

      expect(protectionPlatforms(response)).toEqual({
        series: [{
          data: [{
            name: 'Windows',
            y: 3,
            className: 'active-windows',
            recordLink: { filter: 'WINDOWS'}
          }, {
            name: 'Mac',
            y: 4,
            className: 'active-mac',
            recordLink: { filter: 'MAC'}
          }]
        }]
      });
    });
  });

  describe('Given a summary response containing an osBreakdown with Windows and Windows Server endpoint entries', () => {
    it('should build column chart config with a single Windows series combining counts across all items returned', () => {
      const response: SummaryResponse = Object.assign({},
        endpointResponse, {
          summary: {
            osBreakdown: [{
              os: 'Windows',
              versions: [{
                osName: 'Windows 7',
                osVersion: "",
                count: 2
              },{
                osName: 'Windows 10',
                osVersion: "",
                count: 1
              }]

            },{
              os: 'Windows Server',
              versions: [{
                osName: 'Windows Server 10',
                osVersion: "",
                count: 4
              }]
            }]
          }
      });

      expect(protectionPlatforms(response)).toEqual({
        series: [{
          data: [{
            name: 'Windows',
            y: 7,
            className: 'active-windows',
            recordLink: { filter: 'WINDOWS'}
          }]
        }]
      });
    });
  });

  describe('Given a summary response containing all zero count values in the state breakdown', () => {
    it('Should return a zero state object', () => {
        const response: SummaryResponse = Object.assign({},
            endpointResponse, {
              summary: {
                osBreakdown: []
              }
          });

      expect(protectionPlatforms(response)).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });
});
