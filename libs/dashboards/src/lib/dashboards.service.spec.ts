import { DashboardsService } from './dashboards.service';
import { DashboardItemsListResponse, UserDashboardItem, SharedDashboardItem, DashboardsClient, SharedDashboardRef } from '@al/dashboards';
import { Dashboard } from './dashboard.class';
import { AlNavigationService } from '@al/ng-navigation-components';
import { TestBed } from '@angular/core/testing';
import { DashboardFilters } from './dashboards.types';
import { AIMSClient } from '@al/core';

const mockAlNavigationService = {
  evaluateEntitlementExpression: () => true
};

describe('Dashboard Service', () => {
  let service: DashboardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardsService,
        {provide: AlNavigationService, useValue: mockAlNavigationService}
      ]
    });
    service = TestBed.inject(DashboardsService);
  });

  /*
   *
   */
  describe('after the creation of the service', (() => {
    it('should have teh correct schema for applied filters', (() => {
      expect(typeof service.appliedFilters.start_date_time).toEqual('number');
      expect(typeof service.appliedFilters.end_date_time).toEqual('number');
    }));
  }));

  /*
   *
   */
  describe('when gridToCSV is called', () => {
    it('should throw an error if the data does not include a body or headers', (() => {
      const data = {};
      expect(() => { service.gridToCSV('title', data); }).toThrow(new Error('Invalid data object sent to CSV processor'));
    }));

    it('should call the export function with the correct values', (() => {
      const data = {
        headers: [
          {name: 'Field 1', field: 'field1'},
          {name: 'Field 2', field: 'field2'}
        ],
        body: [
          {field1: 'String Value', field2: 999},
        ]
      };

      const spy = jest.spyOn(service, 'exportCSVContent');
      service.gridToCSV('title', data);
      expect(spy).toHaveBeenCalledWith('title', 'Field 1,Field 2\n"String Value","999"\n');
    }));
  });

  /*
   *
   */
  describe('on initialising the global filters', (() => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should correctly setup the values', (() => {

      const startDateTime: Date = new Date(2000, 0, 1);
      const endDateTime: Date = new Date(2000, 0, 31);
      const filters: DashboardFilters = {
        end_date_time: endDateTime.setHours(23,59,59) / 1000,
        start_date_time: startDateTime.getTime() / 1000
      };
      filters.start_date_time_eod = new Date(filters.start_date_time * 1000).setHours(23, 59, 59, 59) / 1000;
      filters.end_date_time_sod = new Date(filters.end_date_time * 1000).setHours(0, 0, 0, 0) / 1000;

      jest.useFakeTimers('modern').setSystemTime(endDateTime);
      service['initialiseGlobalFilters']();
      expect(service.appliedFilters).toEqual({...filters});
    }));
  }));

  /*
   *
   */
  describe('when running deep copy', () => {
    it('should retrive an exact duplicate of the input data', (() => {
      expect(service.deepCopy({a:1})).toEqual({a:1});
    }));
  });


  /*
   *
   */
  describe('when generating the own dashboards', () => {
    it('should return a new Dashboard for each item in the config', (() => {
      const resp: DashboardItemsListResponse = {
        dashboard_items: [{
          type: 'dashboard_layout'
        }],
        meta_data: {
            total_count: 0,
            offset: 0,
            limit: 0,
            links: {
                last: '1',
                next: '1'
            }
        }
      } as DashboardItemsListResponse;
      const ret: Dashboard[]  = service.generateDashboards(resp.dashboard_items as UserDashboardItem[]);
      expect(ret[0].hasOwnProperty('getLayout')).toEqual(true);
    }));
  });

  describe('When generating dashboard filters', () => {
    describe('for a non shared_dashboard_ref dashboard instance', () => {
      it('should generate a dashboard filter uisng its name and modified property values', () => {
        const dashboardItem: SharedDashboardItem = {
          name: 'Dashboard A',
          id: '1',
          type: 'dashboard',
          dashboard: {
            dashboard_layout: {
              name: 'Dashboard A',
              index: 0,
              meta: {}
            }
          },
          modified: {
            at: 12345,
            by: 'dsffsdfdsfds'
          }
        };
        const filter = service.generateDashboardFilters([dashboardItem])[0];
        expect(filter.icon).toEqual('ui-icon-vertical-align-top');
        expect(filter.label).toEqual('Dashboard A');
        expect(filter.value).toEqual({
          id: '1',
          name: 'Dashboard A',
          code: 0
        });
      });
    });
    describe('for a shared_dashboard_ref dashboard instance', () => {
      it('should generate a dashboard filter uisng its name and modified property values', () => {
        const dashboardItem: SharedDashboardRef = {
          id: '2',
          type: 'shared_dashboard_ref',
          shared_dashboard_ref: {
            name: 'Dashboard B',
            dashboard: {
              dashboard_layout: {
                name: 'Dashboard B',
                index: 0,
                meta: {}
              }
            },
            modified: {
              at: 12345,
              by: 'dsffsdfdsfds'
            }
          },
          modified: {
            at: 12345,
            by: 'dsffsdfdsfds'
          }
        };
        const filter = service.generateDashboardFilters([dashboardItem])[0];
        expect(filter.icon).toEqual('ui-icon-vertical-align-top');
        expect(filter.label).toEqual('Dashboard B');
        expect(filter.value).toEqual({
          id: '2',
          name: 'Dashboard B',
          code: 0
        });
      });
    });
  });
  describe('When updating user shared dashboard references for given SharedDashboardItem objects', () => {
    it('should supply correctly constructed shared_dashboard_ref objects to the DashboardClient', () => {
      jest.spyOn(service['alSession'], 'getPrimaryAccountId').mockReturnValue('2');
      jest.spyOn(DashboardsClient, 'createOwnDashboardItem').mockReturnValue(Promise.resolve({} as UserDashboardItem));
      const sharedDashboardItem: SharedDashboardItem = {
        name: 'Dashboard A',
          id: '1',
          account_id: '12345',
          type: 'dashboard',
          dashboard: {
          },
          modified: {
            at: 12345,
            by: 'dsffsdfdsfds'
          }
      };
      service.updateUserSharedDashboardRefs([sharedDashboardItem]).then(() => {
        expect(DashboardsClient.createOwnDashboardItem).toHaveBeenCalledWith('2', {
          type: 'shared_dashboard_ref',
          shared_dashboard_ref: {
            id: sharedDashboardItem.id,
            account_id: sharedDashboardItem.account_id
          }
        });
      });
    });
  });
  describe('When determining if an acting account has entitlements to view a', () => {
    const entitlements = ['foo', 'bar'];
    let spy: jest.SpyInstance;
    beforeEach(() => {
      spy = jest.spyOn(service['alNavigation'], 'evaluateEntitlementExpression');
    });
    describe('user shared_dashboard_ref', () => {
      it('should use the value of the entitlements on that dashboard during the check', () => {
        const dashboard: UserDashboardItem = {
          type: 'shared_dashboard_ref',
          shared_dashboard_ref: {
            dashboard: {
              _entitlements: entitlements
            }
          }
        };
        service.actingAccountHasDashboardEntitlement(dashboard);
        expect(spy).toHaveBeenCalledWith(entitlements.join('|'));
      });
    });
    describe('shared dashboard', () => {
      it('should use the value of the entitlements on that dashboard during the check', () => {
        const dashboard: SharedDashboardItem = {
          type: 'dashboard',
          name: 'Bla',
          dashboard: {
            _entitlements: entitlements
          }

        };
        service.actingAccountHasDashboardEntitlement(dashboard);
        expect(spy).toHaveBeenCalledWith(entitlements.join('|'));
      });
    });
    describe('dashboard with no entitlements present', () => {
      it('should return a default value of true', () => {
        spy.mockClear();
        const dashboard: SharedDashboardItem = {
          type: 'dashboard',
          name: 'Bla',
          dashboard: {
            _entitlements: []
          }

        };
        expect(service.actingAccountHasDashboardEntitlement(dashboard)).toEqual(true);
        expect(spy).not.toHaveBeenCalledWith(entitlements.join('|'));
      });
    });
  });
  describe('When determining if a given object contains a property key that', ()=> {
    const obj = {
      foo: 'bar'
    };
    describe('exists', () => {
      it('should return true when using the service objectHasDeepProperty method', () => {
        expect(service.objectHasDeepProperty(obj, 'foo')).toBe(true);
      });
      it('should return false when using the service objectHasDeepProperty method but supply an undefined obj param', () => {
        expect(service.objectHasDeepProperty(undefined, 'foo')).toBe(false);
      });
      it('should return false when using the service objectHasDeepProperty method but supply an undefined obj param', () => {
        expect(service.objectHasDeepProperty(obj, '')).toBe(true);
      });
    });
    describe('does not exist', () => {
      it('should return false when using the service objectHasDeepProperty method', () => {
        expect(service.objectHasDeepProperty(obj, 'bla')).toBe(false);
      });
    });
  });
  describe('When determining if an account manages others', () => {
    it('should return a boolean result based on the length of results returned from the @al/core getManagedAccountIds call', () => {
      jest.spyOn(AIMSClient, 'getAccountIdsByRelationship').mockReturnValue(Promise.resolve(['1', '4']));
      service.accountManagesOthers('2').then((managesOthers) => {
        expect(managesOthers).toBe(true);
      });
    });
    it('should return false if an error is thrown from the @al/core getManagedAccountIds call', () => {
      jest.spyOn(AIMSClient, 'getAccountIdsByRelationship').mockReturnValue(Promise.reject());
      service.accountManagesOthers('2').then((managesOthers) => {
        expect(managesOthers).toBe(false);
      });
    });
  });
});
