import { DataSourceArgs } from './dashboards.types';

export const getServiceMethodArgs = (service: string, method: string, accountId: string, args?: DataSourceArgs) => {
  const serviceMethod = `${service}:${method}`;
  let params = {};

  switch (serviceMethod) {
    case 'assets_query:getAccountAssets':
    case 'assets_query:queryExposures':
    case 'assets_query:getExposuresDeploymentSummary':
      params = { query_parameters: args ? args.query_parameters : undefined };
      break;
    case 'iris:getAggregationsForFields':
      params = { filterExpression: args.body, query_parameters: args.query_parameters };
      break;
    case 'kalm:startSimpleQuery':
      params = { urlTail: args.urlTail, query_parameters: (args.query_parameters ? args.query_parameters : {}) };
      break;
    case 'assets_query:getHealth':
      params = { type: args.body.assetType, query_parameters: (args.query_parameters ? args.query_parameters : {}) };
      break;
    case 'responder:getAllPlaybooks':
      params = { parameters: args.query_parameters };
      break;
    case 'responder:getInquiriesHistory':
      params = {
        request: {
          start_timestamp: Math.round(new Date(args.body.start_timestamp).getTime()/1000),
          end_timestamp: Math.round(new Date(args.body.end_timestamp).getTime()/1000),
          ...args.query_parameters
        }
      };
      break;
    case 'responder:getExecutionsHistory':
      params = {
        request: {
          start_timestamp: Math.round(new Date(args.body.start_timestamp).getTime()/1000),
          end_timestamp: Math.round(new Date(args.body.end_timestamp).getTime()/1000),
          ...args.query_parameters
        }
      };
      break;
    case 'gestalt_dashboard:getTriggersTrends':
      params = {
        request: {
          startTime: Math.round(new Date(args.query_parameters.start_timestamp).getTime()/1000),
          endTime: Math.round(new Date(args.query_parameters.end_timestamp).getTime()/1000)
        }
      };
      break;
  }
  return { accountId: accountId, ...params };
};

export const getServiceClient = (service: string, ref:any): Function => {
  const services = {
    assets_query: 'assetsQueryClient',
    iris: 'irisClient',
    subscriptions: 'subscriptionsClient',
    kalm: 'kalmClient',
    deployments: 'deploymentsClient',
    endpoints: 'endpointsClient',
    alSearchClientV2: 'alSearchClientV2',
    alSearchStylist: 'alSearchStylist',
    fim: 'alFimClient',
    responder: 'alResponderClient',
    gestalt_dashboard: 'alGestaltDashboardClient'
  };
  return ref[services[service]] || null;
};
