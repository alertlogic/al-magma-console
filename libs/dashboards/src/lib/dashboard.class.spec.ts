/*
 * Dashboard Class Test Suite
 *
 * @author robert.parker <robert.parker@alertlogic.com>
 * @copyright Alert Logic 2019
 *
 */

import { Dashboard } from './dashboard.class';
import { DashboardsService } from './dashboards.service';
import { SharedDashboardRef } from '@al/dashboards';
import { ZeroStateReason, ZeroState, Widget as WidgetConfig, WidgetContentType, WidgetButtonActionMethods } from '@al/ng-visualizations-components';

describe('Dashboard Class Test Suite', () => {
  let dashboard: Dashboard;

  const dashboardService = {} as DashboardsService;
  dashboardService.deepCopy = jest.fn().mockImplementation((o) => JSON.parse(JSON.stringify(o)));
  dashboardService.appliedFilters = {
    start_date_time: 12345,
    end_date_time: 67890
  };

  let zeroState: ZeroState;
  let widgetConfigs: WidgetConfig[];

  const userSharedDashboardRefItem: SharedDashboardRef = {
    id: 'xyz',
    type: 'shared_dashboard_ref',
    shared_dashboard_ref: {
      dashboard: {
        dashboard_layout: {
          refreshRate: 600,
          widgets: [{
            name: "Protected Network Status",
            data_source: {
                transformation: "protectedAssetHealthStatus",
                sources: [
                    {
                        service: "assets_query",
                        method: "getHealthSummary"
                    }
                ]
            },
            content: {
                type: "semi_circle"
            },
            config: {
                width: 1,
                position: 3,
                height: 1
            },
            actions: {
                primary: {
                    name: "Investigate",
                    action: {
                        target_app: "cd17:health",
                        query_params: {
                            no_filters: "true"
                        },
                        path: "/#/networks/:accountId"
                    }
                },
                drilldown: {
                    name: "",
                    action: {
                        target_app: "cd17:health",
                        path: "/#/networks/:accountId"
                    }
                }
            }
          }]
        }

      }
    }
  };

  describe('when loading a valid shared_dashboard_ref item', () => {
    beforeEach(() => {
      dashboard = new Dashboard(userSharedDashboardRefItem, dashboardService);
    });
    it('should successfully generate a layout item for UI display', () => {
      expect(dashboard.layout.length).toBe(1);
    });
    describe('and data retrival is performed', () => {
      beforeEach(() => {

        widgetConfigs = [{
          id: '0',
          title: 'some widget',
          metrics: { height: 1, width: 1},
          content: {
            type: WidgetContentType.Bar,
            data: {}
          },
          actions:{
            primary: {
              name: 'Investigate'
            }
          }
        }];
        jest.spyOn(dashboard['widgets'][0], 'getData').mockImplementation(() => Promise.resolve(zeroState));
      });
      describe('but an API failure occurs', () => {
        it('should set a Refresh primary action and a Call Support telephone link', () => {
          zeroState = {
            nodata: true,
            reason: ZeroStateReason.API
          };
          dashboard.getData('12345', widgetConfigs).then(() => {
            expect(widgetConfigs[0].actions).toEqual({
              primary: {
                name: 'Refresh',
                action: {
                  method: WidgetButtonActionMethods.Refresh
                }
              },
              link1: {
                name: "Call Support",
                action: {
                  method: WidgetButtonActionMethods.Support,
                  url: 'tel:+18774848383'
                }
              }
            });
          });
        });
      });
      describe('but an Entitlement failure occurs', () => {
        it('should set a Refresh primary action and a Call Support telephone link', () => {
          zeroState = {
            nodata: true,
            reason: ZeroStateReason.Entitlement
          };
          dashboard.getData('12345', widgetConfigs).then(() => {
            expect(widgetConfigs[0].actions).toEqual({
              primary: {
                name: "Contact Sales",
                action: {
                  method: WidgetButtonActionMethods.Support,
                  url: 'https://www.alertlogic.com/get-started/?ContactSales=true'
                }
              }
            });
          });
        });
      });
      describe('and zero data is returned', () => {
        it('should set a Refresh primary action and a Call Support telephone link', () => {
          zeroState = {
            nodata: true,
            reason: ZeroStateReason.Zero
          };
          dashboard.getData('12345', widgetConfigs).then(() => {
            expect(widgetConfigs[0].actions).toEqual({
              link1: {
                name: "Why is this graph empty?",
                action: {
                  method: WidgetButtonActionMethods.NoData
                }
              }
            });
          });
        });
      });
      describe('and no error or zero state is returned', () => {
        it('should persist the existing configured actions', () => {
          zeroState = {
            nodata: false,
            reason: ZeroStateReason.API
          };
          dashboard.getData('12345', widgetConfigs).then(() => {
            expect(widgetConfigs[0].actions).toEqual({
              primary: {
                name: "Investigate",
                action: {
                    target_app: "cd17:health",
                    query_params: {
                        no_filters: "true"
                    },
                    path: "/#/networks/:accountId"
                }
              },
              drilldown: {
                  name: "",
                  action: {
                      target_app: "cd17:health",
                      path: "/#/networks/:accountId"
                  }
              }
            });
          });
        });
      });
    });
  });
});
