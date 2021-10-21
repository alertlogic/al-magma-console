/*
 *
 *
 */
import { SourceConfig, DataSourceArgs, DashboardFilters } from './dashboards.types';
import { AlAssetsQueryClient } from '@al/assets-query';
import { ZeroStateReason } from '@al/ng-visualizations-components';
import { AlIrisClient } from '@al/iris';
import { AlKalmClient } from '@al/kalm';
import { AlEndpointsClient } from '@al/endpoints';
import { AlFimClient } from '@al/fim';
import { AlResponderClient } from '@al/responder';
import { AlGestaltDashboardsClient } from '@al/gestalt';
import { SubscriptionsClient, AlSearchClientV2 } from '@al/core';
import { AlDeploymentsClient } from '@al/deployments';
import {
  DashboardsClient,
  UserDashboardItem
} from '@al/dashboards';
import { getServiceMethodArgs, getServiceClient } from './source.utilities';

export class Source {

  private id: string;
  private sourceConfig: SourceConfig = null;
  private dataResponse: any[] = [];
  private hasSource = false;
  private accountId: string;
  private appliedFilters: DashboardFilters;
  private dashboardsClient = DashboardsClient;
  private assetsQueryClient = AlAssetsQueryClient;
  private irisClient = AlIrisClient;
  private kalmClient = AlKalmClient;
  private endpointsClient = AlEndpointsClient;
  private subscriptionsClient = SubscriptionsClient;
  private deploymentsClient = AlDeploymentsClient;
  private alFimClient = AlFimClient;
  private alSearchClientV2 = AlSearchClientV2;
  private alResponderClient = AlResponderClient;
  private alGestaltDashboardClient = AlGestaltDashboardsClient;
  private foo = 1;

  /*
   * Pass through an ID only so that the class will go and get the configuration object
   * from the Dashboards API
   *
   * or
   *
   * Pass through the ID and a pre built configuration object.  Passing through a pre-built object
   * will negate calling out to the Dashboards API - this class is then purely used to run the
   * getData method
   *
   */
  constructor(
    arg: string | SourceConfig
    ) {
    if (typeof arg === 'string') {
      this.id = arg;
    } else {
      this.sourceConfig = this.deepCopy(arg);
      this.hasSource = true;
    }
  }

  /*
   * Return the Source Configuration
   */
  public getConfig = (): SourceConfig => {
    return this.sourceConfig;
  }

  /*
   * Deep copies simple objects.
   */
  private deepCopy(o: any): any {
    return JSON.parse(JSON.stringify(o));
  }

  /*
   * Generate a config object viewable publicly
   */
  private buildConfig = (source: UserDashboardItem): SourceConfig => {
    if (source.data_source) {
      const sourceName = source.name;
      const sources = source.data_source.sources;

      this.sourceConfig = {
        id: this.id,
        name: sourceName,
        dataSources: [...sources]
      };
      return this.sourceConfig;
    }
    return null;
  }

  /*
   * Call out to the Dashboards End Point to grab the config
   * for this source.  If this has already been done just return
   * the config.
   */
  public loadConfig = (userAccountId: string, userId: string) => {
    // Return the widget config immediately if it's already available
    return new Promise((resolve, reject) => {
      if (this.hasSource) {
        resolve(this.sourceConfig);
      } else {
        this.dashboardsClient.getUserDashboardItem(userAccountId, userId, this.id)
          .then((source: UserDashboardItem) => {
            this.hasSource = true;
            resolve(this.buildConfig(source));
          });
      }
    });
   }

  /*
   * A source may require data from multiple endpoints.  Call all endpoints before returning
   * the data.
   */
  public getData = (accountId: string, appliedFilters: DashboardFilters): Promise<{}> => {
    this.accountId = accountId;
    this.appliedFilters = appliedFilters;
    const responses = [];

    return new Promise((resolve, reject) => {

      if (this.sourceConfig.dataSources[0].mock) {
        resolve(this.sourceConfig.dataSources[0].mock);

      } else {
        for (const source of this.sourceConfig.dataSources) {
          responses.push(this.getEndPoint(source.service, source.method, source.args));
        }

        // Return all the responses - but if it's only one then just reduce it down to a singular object
        Promise.all(responses)
          .then((responsesData) => {
            resolve(responsesData.length === 1 ? responsesData[0] : responsesData);
          })
          .catch((e) => {
            reject({
              nodata: true,
              reason: ZeroStateReason.API
            });
          });
      }
    });
  }

  /*
   *  Get the end point method from the service and method required.
   *  @service {string} - indicator which Nepal service to use
   *  @method {string} - which endpoint to call on the service
   *  returns - Promise
   */
  private getEndPoint = (service: string, method: string, args?: DataSourceArgs): Promise<any> => {
    const serviceClient: Function = getServiceClient(service, this);
    let promise: Promise<any>;

    // Bomb out on invalid service or service method
    if (!serviceClient || !serviceClient[method]) {
      console.error(`A method named "${method}" for "${service}" service could either not be found or no handling has been implemented for it yet`);
      promise = Promise.reject({
        nodata: true,
        reason: ZeroStateReason.API
      });
      return promise;
    }

    // Same arguments need dynamically updating such as date filters
    if(args && this.appliedFilters) {
      args = this.convertArgValues(args);
    }

    // Call the end point with the requiste params
    promise = serviceClient[method](...Object.values(getServiceMethodArgs(service, method, this.accountId, args )));
    return promise;
  }

  /*
   * Takes a Date object and return a date string in the format
   * yyyy-mm-dd
   *
   * Months and Days return single digit number i.e. 1st = 1 rather than 01
   * this makes sure that it'll send two digits i.e. 1 becomes 01
   */
  private simpleDate = (date: Date): string => {
   const year: number = date.getFullYear();
   const month: string = `0${String(date.getMonth() + 1)}`.slice(-2);
   const day: string = `0${String(date.getDate())}`.slice(-2);

   return `${year}-${month}-${day}`;
  }

  /*
   *  Utility function to iterate over values in an object and replace known tokens for real value equivalents.
   *  NOTE - This is being kept here for reference purposes as we will need to make use of this in a future release
   */
  private convertArgValues = (args: any) => {
    let cp = JSON.stringify(args);
    cp = cp.replace(/<start_date_local>/g, this.simpleDate((new Date(this.appliedFilters.start_date_time * 1000))));
    cp = cp.replace(/<end_date_local>/g, this.simpleDate((new Date(this.appliedFilters.end_date_time * 1000))));
    cp = cp.replace(/<start_date_time>/g, (new Date(this.appliedFilters.start_date_time * 1000)).toISOString());
    cp = cp.replace(/<end_date_time>/g, (new Date(this.appliedFilters.end_date_time * 1000)).toISOString());
    cp = cp.replace(/<current_date_at_zero>/g, new Date(new Date().setHours(0,0,0,0)).toISOString());
    cp = cp.replace(/<start_date_time_eod>/g, (new Date(this.appliedFilters.start_date_time_eod * 1000)).toISOString());
    cp = cp.replace(/<end_date_time_sod>/g, (new Date(this.appliedFilters.end_date_time_sod * 1000)).toISOString());
    return JSON.parse(cp);
  }
}
