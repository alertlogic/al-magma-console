/*
 * Source Class Test Suite
 *
 * @author robert.parker <robert.parker@alertlogic.com>
 * @copyright Alert Logic 2019
 *
 */

import { Source } from './source.class';
import { SourceConfig, DataSourceArgs, DashboardFilters } from './dashboards.types';
import { UserDashboardItem } from '@al/dashboards';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { AssetQueryGeneralResponse, ExposuresSummary, HealthSummaryResponse } from '@al/assets-query';

describe('Source Class Test Suite', () => {
  let source: Source;
  const sourceConfig: SourceConfig = {
    id: 'foo',
    name: 'some datasource',
    dataSources: []
  };
  const userAccountId = '2';
  const userId = '12345';
  const mockAPIResponse = {foo: 'bar'};
  const mockAPIResponseMultiple = [{foo: 'bar'}, {foo: 'bar'}];
  const zeroStateResponse = {
    nodata: true,
    reason: ZeroStateReason.API
  };

  describe('on initialising the class', () => {
    describe('with a string value passed into the constructor', () => {
      it('should assign the value to the class id property', () => {
        const arg = 'foo';
        source = new Source(arg);
        expect(source['id']).toEqual(arg);
      });
    });
    describe('with a SourceConfig value passed into the constructor', () => {
      it('should assign the value to the class sourceConfig property and set hasSource to true', () => {
        source = new Source(sourceConfig);
        expect(source['sourceConfig']).toEqual(sourceConfig);
        expect(source['hasSource']).toEqual(true);
      });
    });

  });
  describe('When retrieving config stroed on the Source class', () => {
    it('should return the value of the class sourceConfig property', () => {
      source = new Source(sourceConfig);
      expect(source.getConfig()).toEqual(sourceConfig);
    });
  });
  describe('when loading config for a source', () => {
    describe('that has been already loaded previously into the class instance', () => {
      it('should return the value of the class sourceConfig', () => {
        source = new Source(sourceConfig);
        source.loadConfig(userAccountId, userId).then((response) => {
          expect(response).toEqual(sourceConfig);
        });
      });
    });
    describe('that has not yet been loaded into the class instance', () => {
      it('should retrieve and return a correctly formatted config object using the data_source value returned from the DashboardsClient', () => {
        const sourceId = '123';
        source = new Source(sourceId);
        const item: UserDashboardItem = {
          type: 'data_source',
          name: 'bla',
          data_source: {
            sources:[]
          }
        };
        jest.spyOn(source['dashboardsClient'], 'getUserDashboardItem').mockReturnValue(Promise.resolve(item));
        source.loadConfig(userAccountId, userId).then((response) => {
          expect(response).toEqual({
            id: sourceId,
            name: item.name,
            dataSources: item.data_source.sources
          });
        });
      });
    });
  });
  describe('when retrieving data', () => {
    describe('and the service being queried returns a bad response', () => {
      it('should reject with an object containing zero state properties', () => {
        const assetsQuerySourceConfig: SourceConfig = {
          id: 'foo',
          name: 'Health Summary',
          dataSources: [{
            service: 'assets_query',
            method: 'getHealthSummary'
          }]
        };
        source = new Source(assetsQuerySourceConfig);
        jest.spyOn(source['assetsQueryClient'], 'getHealthSummary').mockReturnValue(Promise.reject(mockAPIResponse));
        source.getData(userAccountId,undefined).then((r) => {
          expect(r).toEqual({
            nodata: true,
            reason: ZeroStateReason.API
          });
        });
      });
    });
    describe('for a datasource that needs to get health summary data', () => {
      it('should retrieve and return a response from getHealthSummary on the Assets Query Client', async() => {
        jest.spyOn(source['assetsQueryClient'], 'getHealthSummary').mockReturnValue(Promise.resolve(mockAPIResponse as HealthSummaryResponse));
        const assetsQuerySourceConfig: SourceConfig = {
          id: 'foo',
          name: 'Health Summary',
          dataSources: [{
            service: 'assets_query',
            method: 'getHealthSummary'
          }]
        };
        source = new Source(assetsQuerySourceConfig);
        const r = await source.getData(userAccountId,undefined);
        expect(r).toEqual(mockAPIResponse);
        expect(source['assetsQueryClient'].getHealthSummary).toHaveBeenCalled();
      });
    });
  });
  describe('for a datasource that needs to get account asset data', () => {
    it('should retrieve and return a response from getAccountAssets on the Assets Query Client', async() => {
      jest.spyOn(source['assetsQueryClient'], 'getAccountAssets').mockReturnValue(Promise.resolve({} as AssetQueryGeneralResponse));
      const assetsQuerySourceConfig: SourceConfig = {
        id: 'foo',
        name: 'Account Assets',
        dataSources: [{
          service: 'assets_query',
          method: 'getAccountAssets'
        }]
      };
      source = new Source(assetsQuerySourceConfig);
      const r = await source.getData(userAccountId,undefined)

      expect(r).toEqual({});
      expect(source['assetsQueryClient'].getAccountAssets).toHaveBeenCalled();

    });
    describe('with extra query parameters', () => {
      it('should retrieve and return a response from getAccountAssets on the Assets Query Client', () => {
        jest.spyOn(source['assetsQueryClient'], 'getAccountAssets').mockReturnValue(Promise.resolve({} as AssetQueryGeneralResponse));
        const assetsQuerySourceConfig: SourceConfig = {
          id: 'foo',
          name: 'Account Assets',
          dataSources: [{
            service: 'assets_query',
            method: 'getAccountAssets',
            args: {
              query_parameters: {foo: 'bar'}
            }
          }]
        };
        source = new Source(assetsQuerySourceConfig);
        source.getData(userAccountId,undefined).then((r) => {
          expect(r).toEqual(mockAPIResponse);
          expect(source['assetsQueryClient'].getAccountAssets).toHaveBeenCalled();
          expect(source['assetsQueryClient'].getAccountAssets).toHaveBeenCalledWith(userAccountId, {foo: 'bar'});
        });
      });
    });
  });
  describe('for a datasource that needs to get deployment exposures data', () => {
    it('should retrieve and return a response from getExposuresDeploymentSummary on the Assets Query Client', () => {
      jest.spyOn(source['assetsQueryClient'], 'getExposuresDeploymentSummary').mockReturnValue(Promise.resolve({} as ExposuresSummary));
      const assetsQuerySourceConfig: SourceConfig = {
        id: 'foo',
        name: 'Account Assets',
        dataSources: [{
          service: 'assets_query',
          method: 'getExposuresDeploymentSummary'
        }]
      };
      source = new Source(assetsQuerySourceConfig);
      source.getData(userAccountId,undefined).then((r) => {
        expect(r).toEqual(mockAPIResponse);
        expect(source['assetsQueryClient'].getExposuresDeploymentSummary).toHaveBeenCalled();
      });
    });
    describe('for a datasource that needs to query exposures data', () => {
      it('should retrieve and return a response from queryExposures on the Assets Query Client', () => {
        jest.spyOn(source['assetsQueryClient'], 'queryExposures').mockReturnValue(Promise.resolve({}));
        const assetsQuerySourceConfig: SourceConfig = {
          id: 'foo',
          name: 'Query Exposures',
          dataSources: [{
            service: 'assets_query',
            method: 'queryExposures'
          }]
        };
        source = new Source(assetsQuerySourceConfig);
        source.getData(userAccountId,undefined).then((r) => {
          expect(r).toEqual(mockAPIResponse);
          expect(source['assetsQueryClient'].queryExposures).toHaveBeenCalled();
        });
      });
    });
  });
  describe('for a datasource that needs to get aggregation data from IRIS', () => {
    it('should retrieve and return a response from getAggregationsForFields on the Assets Query Client', () => {
      jest.spyOn(source['irisClient'], 'getAggregationsForFields').mockReturnValue(Promise.resolve(mockAPIResponse));
      const irisQuerySourceConfig: SourceConfig = {
        id: 'foo',
        name: 'Incident Count by Severity',
        dataSources: [{
          service: 'iris',
          method: 'getAggregationsForFields',
          args: {
            body: {},
            query_parameters: {}
          }
        }]
      };
      source = new Source(irisQuerySourceConfig);
      source.getData(userAccountId,undefined).then((r) => {
        expect(r).toEqual(mockAPIResponse);
        expect(source['irisClient'].getAggregationsForFields).toHaveBeenCalled();
      });
    });
  });
  describe('for a datasource that needs to get account asset AND health summary data', () => {
    it('should retrieve and return an array of responses', () => {
      jest.spyOn(source['assetsQueryClient'], 'getAccountAssets').mockReturnValue(Promise.resolve({} as AssetQueryGeneralResponse));
      jest.spyOn(source['assetsQueryClient'], 'getHealthSummary').mockReturnValue(Promise.resolve({} as HealthSummaryResponse));
      const assetsQuerySourceConfig: SourceConfig = {
        id: 'foo',
        name: 'Account Assets',
        dataSources: [{
          service: 'assets_query',
          method: 'getHealthSummary'
        },
        {
          service: 'assets_query',
          method: 'getAccountAssets'
        }]
      };
      source = new Source(assetsQuerySourceConfig);
      source.getData(userAccountId,undefined).then((r) => {
        expect(r).toEqual(mockAPIResponseMultiple);
        expect(source['assetsQueryClient'].getAccountAssets).toHaveBeenCalled();
        expect(source['assetsQueryClient'].getHealthSummary).toHaveBeenCalled();
      });
    });
  });
  describe('for a datasource configured with an unknown service', () => {
    it('should throw an error', async() => {
      const foobarSourceConfig: SourceConfig = {
        id: 'foo',
        name: 'Something else',
        dataSources: [{
          service: 'foobar',
          method: 'getSomeThingElse'
        }]
      };
      jest.spyOn(console, 'error');
      source = new Source(foobarSourceConfig);
      source.getData(userAccountId,undefined).then((r) => {
        expect(r).toEqual(zeroStateResponse);
        expect(console.error).toHaveBeenCalledWith('A method named "getSomeThingElse" for "foobar" service could either not be found or no handling has been implemented for it yet');
      });
    });
  });
});
