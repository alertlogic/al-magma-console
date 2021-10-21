/*
 * Dashboards Component Test Suite
 *
 * @author Stephen Jones <stephen.jones@alertlogic.com>
 * @author Robert Parker <robert.parker@alertlogic.com>
 * @copyright Alert Logic 2019
 *
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Dashboard } from './dashboard.class';
import { DashboardFilter } from './dashboards.types';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DashboardsComponent } from './dashboards.component';
import { DashboardsService } from './dashboards.service';
import { WidgetButtonAction, WidgetContentType } from '@al/ng-visualizations-components';
import { AlNavigationService } from '@al/ng-navigation-components';
import {
  DashboardsClient,
  DashboardItemsListResponse,
  DashboardGroupsResponse,
} from '@al/dashboards';
import {
  AlSession,
  AlActingAccountResolvedEvent,
  AlEntitlementCollection,
  AIMSAccount
} from '@al/core';
import { AlSelectorComponent } from '@al/ng-generic-components';
import { UserPreferencesService } from './user-preferences.service';


class MockDashboardService {
  public appliedFilters = {
    start_date_time: 1,
    end_date_time: 2
  };
  public navigate(url: string) {
    return null;
  }
  public deepCopy(o: any): any {
    return JSON.parse(JSON.stringify(o));
  }
  public generateDashboards(o: any): any {
    return {};
  }
  public generateDashboardsFromShared(o: any): any {
    return {};
  }
  public generateDashboardFilters(o: any): any {
    return {};
  }
  public updateUserSharedDashboardRefs(o: any): any {
    return Promise.resolve();
  }
  public actingAccountHasDashboardEntitlement(item: any): any {
    return true;
  }
  public objectHasDeepProperty(obj: any, path: string): boolean {
    return true;
  }
  public accountManagesOthers(s: string): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(false);
    });
  }
}

class MockUserPreferencesService {
  public set() {
    return {
      isDark: true,
      color: ''
    };
  }
  public get() {
    return {
      isDark: true,
      color: ''
    };
  }
}

class AlSelectorComponentStub {

}

describe('DashboardsComponent', () => {

  const actingAccountChangedEv = new AlActingAccountResolvedEvent({
      id: '1234',
      name: 'Rob corp',
      active: true,
      accessible_locations: ['wales'],
      default_location: 'wales',
      created: {at:0, by: 'rob'},
      modified: {at:0, by: 'rob'}
    },
    new AlEntitlementCollection(),
    new AlEntitlementCollection()
  );
  let isEntitled = true;
  const alNavigationServiceStub = {
    navigate: {
      byLocation: () => {},
      byNgRoute: () => {}
    },
    evaluateEntitlementExpression: () => isEntitled,
    queryParams: {},
    events: {
      attach: (a, b) => {}
    },
    track: () => {}
  };
  let updateUserDashboardItemsSpy: jest.SpyInstance;
  let component: DashboardsComponent;
  let fixture: ComponentFixture<DashboardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{
        provide: DashboardsService,
        useClass: MockDashboardService
      }, {
        provide: UserPreferencesService,
        useClass: MockUserPreferencesService
      },{
        provide: AlNavigationService,
        useValue: alNavigationServiceStub
      }, {
        provide: AlSelectorComponent,
        useClass: AlSelectorComponentStub
      }],
      imports: [
        RouterTestingModule.withRoutes([])
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardsComponent);
    component = fixture.componentInstance;
    updateUserDashboardItemsSpy = jest.spyOn(component as any, 'updateUserDashboardItems').mockImplementation(() => Promise.resolve());
    window.scrollTo = jest.fn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*
   * Document Level Key Press Handlers
   */
  describe('when pressing keys on the global document level', () => {
    // TODO - Revist this test - won't work under Jenkins as it tests DOCUMENT level events
    // and although this works loacally - Jenkins balks at it
    xit('should trigger fullscreen on the key combination ctrl+u', async(() => {
      const spy = jest.spyOn(component as any, 'fullscreen');
      component.handleKeyboardEvent(new KeyboardEvent('keyup', { code: 'KeyU', ctrlKey: true }));
      expect(spy).toHaveBeenCalled();
    }));

    it('should trigger dark mode on the key combination ctrl+d', async(() => {
      const spy = jest.spyOn(component as any, 'applyDarkMode');
      component.handleKeyboardEvent(new KeyboardEvent('keyup', { code: 'KeyD', ctrlKey: true }));
      expect(spy).toHaveBeenCalled();
    }));
  });

  /*
   *
   */
  describe('when selecting darkmode', () => {
    it('should set isDark to true and apply "darkMode" class to the body element and track the event', (() => {
      component['applyDarkMode']();
      expect(component['isDark']).toEqual(true);
      expect(document.body.classList.contains('darkMode')).toEqual(true);
    }));
    it('should set isDark to false and remove "darkMode" class from the body element and track the event', (() => {
      component['applyDarkMode'](false);
      expect(component['isDark']).toEqual(false);
      expect(document.body.classList.contains('darkMode')).toEqual(false);
    }));
  });

  /*
   *
   */
  describe('when the fullscreen event is fired', () => {
    const fullScreenEvent = (evt: string) => {
      it(`should call processFullScreen when event [${evt}] is fired`, (() => {
        const spy = jest.spyOn(component as any, 'processFullscreen');
        const e = new CustomEvent(evt);
        component['container'].nativeElement.dispatchEvent(e);
        expect(spy).toHaveBeenCalled();
      }));
    };
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(item => {
      fullScreenEvent(item);
    });
  });

  /*
   *
   */
  describe('when requesting full screen - across browser types', () => {
    const requestFullscreen = (t: string) => {
      it(`should request the ${t} method`, (() => {
        const el = {
          nativeElement: {}
        };
        el.nativeElement[t] = function () { };
        const spy = jest.spyOn(el.nativeElement as any, t);

        component['requestFullScreen'](el);
        expect(spy).toHaveBeenCalled();
      }));
    };

    ['requestFullscreen', 'webkitRequestFullscreen', 'mozRequestFullScreen', 'msRequestFullscreen'].forEach(item => {
      requestFullscreen(item);
    });
  });

  /*
   *
   */
  describe('when requesting exit full screen - across browser types', () => {
    const exitFullScreen = (t: string) => {
      it(`should request the ${t} method`, (() => {
        const doc = {};
        doc[t] = function () { };
        const spy = jest.spyOn(doc as any, t);

        component['exitFullScreen'](doc);
        expect(spy).toHaveBeenCalled();
      }));
    };
    ['exitFullscreen', 'webkitExitFullscreen', 'mozCancelFullScreen', 'msExitFullscreen'].forEach(item => {
      exitFullScreen(item);
    });
  });

  /*
   *
   */
  describe('when clicking on the presentation menu', () => {
    it('should apply light mode when light Mode is clicked', (() => {
      const spy = jest.spyOn(component as any, 'applyDarkMode');
      component['presentationItems'][0].command();
      expect(spy).toHaveBeenCalledWith(false);
    }));

    it('should apply dark mode when Dark Mode is clicked', (() => {
      const spy = jest.spyOn(component as any, 'applyDarkMode');
      component['presentationItems'][1].command();
      expect(spy).toHaveBeenCalledWith(true);
    }));

    it('should toggle full screen when Full Screen is clicked', (() => {
      const spy = jest.spyOn(component as any, 'fullscreen');
      component['presentationItemsFullscreen'].command();
      expect(spy).toHaveBeenCalled();
    }));

    it('should toggle full screen when Exit Full Screen is clicked', (() => {
      const spy = jest.spyOn(component as any, 'fullscreen');
      component['presentationItemsExitFullscreen'].command();
      expect(spy).toHaveBeenCalled();
    }));
  });

  /*
   *
   */
  describe('when calling fullscreen toggle', () => {
    it('should call exitFullScreen if it is enabled and track usage to GA', (() => {
      const spy = jest.spyOn(component as any, 'exitFullScreen');
      const spyTrack = jest.spyOn(component['alNavigation'] as any, 'track');
      jest.spyOn(component as any, 'fullScreenElement').mockReturnValue(true);
      component['fullscreen']();
      expect(spy).toHaveBeenCalled();
      expect(spyTrack).toHaveBeenCalledWith('ui.usagetrackingevent', {
        category: 'Dashboard Action',
        action: 'Toggle Screen Mode',
        label: 'Normal Screen'
      });
    }));

    it('should call requestFullScreen if it is not enabled and is tracked by SegmentIO', (() => {
      const spy = jest.spyOn(component as any, 'requestFullScreen');
      const spyTrack = jest.spyOn(component['alNavigation'] as any, 'track');
      jest.spyOn(component as any, 'fullScreenElement').mockReturnValue(false);
      component['fullscreen']();
      expect(spy).toHaveBeenCalled();
      expect(spyTrack).toHaveBeenCalledWith('ui.usagetrackingevent', {
        category: 'Dashboard Action',
        action: 'Toggle Screen Mode',
        label: 'Full Screen'
      });
    }));
  });

  describe('when selecting a dashboard', () => {
    let dashboardA;
    beforeEach(() => {
      dashboardA = new Dashboard({
        name: 'Dashboard A',
        type: 'dashboard',
        id: '1',
        dashboard: {
          dashboard_layout: {
            index: 0,
            refreshRate: 600,
            widgets: []
          }
        }
      }, component['dashboardsService']);
      component['dashboards'] = [dashboardA];
    });
    it('should attempt to load the correct dashboard', (() => {
      const spy = jest.spyOn(component, 'loadDashboard');
      const e: DashboardFilter = {
        label: 'something',
        icon: 'something',
        value: {
          id: '0',
          name: 'mock',
          code: 0,
          uniqueRef: '0'
        }
      };
      component['selectDashboard'](e);
      expect(spy).toHaveBeenCalledWith(0);
    }));
  });

  describe('when attempting to load a dashboard', () => {
    let dashboardA;
    let dashboardB;
    beforeEach(() => {
      dashboardA = new Dashboard({
        name: 'Dashboard A',
        type: 'dashboard',
        id: '1',
        dashboard: {
          dashboard_layout: {
            index: 0,
            refreshRate: 600,
            widgets: []
          }
        }
      }, component['dashboardsService']);
      dashboardB = new Dashboard({
        name: 'Dashboard B',
        type: 'dashboard',
        id: '2',
        dashboard: {
          dashboard_layout: {
            index: 1,
            refreshRate: 600,
            widgets: []
          }
        }
      }, component['dashboardsService']);
      component['dashboards'] = [dashboardA, dashboardB];
    });
    describe('on initial application start', () => {
      describe('and a last_visible_dashboard_id local storage item is found which exists in the dashboards already loaded', () => {
        beforeEach(() => {
          jest.spyOn(component['userPreferencesService'], 'get').mockReturnValue('1');
        });
        it('should load that particular dashboard layout', () => {
          component.loadDashboard(0, true);
          expect(component.layoutConfig).toEqual(dashboardA.layout);
        });
      });
      describe('and a last_visible_dashboard_id local storage item is found which DOES NOT exist in the dashboards already loaded', () => {
        it('should load that particular dashboard layout', () => {
          jest.spyOn(component['userPreferencesService'], 'get').mockReturnValue('3');
          component.loadDashboard(1, true);
          expect(component.layoutConfig).toEqual(dashboardB.layout);
        });
      });
      describe('and a last_visible_dashboard_id local storage item is not present', () => {
        beforeEach(() => {
          jest.spyOn(component['userPreferencesService'], 'get').mockReturnValue(null);
        });
        it('should load the requested dashboard layout', () => {
          component.loadDashboard(1, true);
          expect(component.layoutConfig).toEqual(dashboardB.layout);
        });
        describe('and the dashboard has a "DATE_SHOW" meta tag', ()=> {
          it('should set the date picker properties correctly', () => {
            dashboardA = new Dashboard({
              name: 'Dashboard A',
              type: 'dashboard',
              id: '1',
              dashboard: {
                dashboard_layout: {
                  index: 0,
                  refreshRate: 600,
                  widgets: [],
                  meta: {
                    tags: ['DATE_SHOW']
                  }
                }
              }
            }, component['dashboardsService']);
            component['dashboards'] = [dashboardA];
            component.loadDashboard(0, true).then(() => {
              expect(component.datePickerSelectionMode).toEqual('single');
              expect(component.showDateSelectionOptions).toBe(false);
              expect(component.datePickerInputFormat).toEqual('DD, M dd, yy');
            });
          });
        });
        describe('and the dashboard has a "DATE_RANGE" meta tag', ()=> {
          it('should set the date picker properties correctly', () => {
            dashboardA = new Dashboard({
              name: 'Dashboard A',
              type: 'dashboard',
              id: '1',
              dashboard: {
                dashboard_layout: {
                  index: 0,
                  refreshRate: 600,
                  widgets: [],
                  meta: {
                    tags: ['DATE_RANGE']
                  }
                }
              }
            }, component['dashboardsService']);
            component['dashboards'] = [dashboardA];
            component.loadDashboard(0, true).then(() => {
              expect(component.datePickerSelectionMode).toEqual('range');
              expect(component.showDateSelectionOptions).toBe(true);
              expect(component.datePickerInputFormat).toEqual('dd M yy');
            });
          });
        });
        describe('and the dashboard has a "UNKNOWN" meta tag', ()=> {
          it('should set the date picker visibility property to false', () => {
            dashboardA = new Dashboard({
              name: 'Dashboard A',
              type: 'dashboard',
              id: '1',
              dashboard: {
                dashboard_layout: {
                  index: 0,
                  refreshRate: 600,
                  widgets: [],
                  meta: {
                    tags: ['UNKNOWN']
                  }
                }
              }
            }, component['dashboardsService']);
            component['dashboards'] = [dashboardA];
            component.loadDashboard(0, true).then(() => {
              expect(component.showDateControls).toBe(false);
            });
          });
        });
      });
    });
    describe('after subsequent initial application start', () => {
      it('should load the requested dashboard layout', () => {
        component.dashboardFilters = [{
          label: 'Dashboard B',
          icon: 'ui-icon-vertical-align-topxx',
          value: {
            id: '2',
            name: 'Dashboard B',
            code: 1
          }
        }];
        component.loadDashboard(1);
        expect(component.layoutConfig).toEqual(dashboardB.layout);
        expect(component.selectedDashboardFilter).toEqual(component.dashboardFilters[0]);
      });
    });
  });

  describe('when a widget has emitted its click event', () => {
    let trackSpy;

    beforeEach(() => {
      component['actingAccountId'] = '123';
      trackSpy = jest.spyOn(component['alNavigation'] as any, 'track');
      component['dashboards'].push({
        getConfig: function () {
          return {
            name: 'test'
          };
        }
      } as Dashboard);
      component['currentDashboard'] = 0;
    });

    it('should track via segment if "target_app" is supplied', (() => {
      const navigateSpy = jest.spyOn(component['alNavigation'].navigate as any, 'byLocation');
      const buttonAction: WidgetButtonAction = {
        target_app: 'target_app',
        url: 'url',
        path: '/:accountId/path',
        query_params: {}
      };
      const ev: CustomEventInit = {
        detail: {
          buttonAction,
          id: '1',
          title: 'My Widget'
        }
      };

      component['widgetButtonActionHandler'](ev);
      expect(trackSpy).toHaveBeenCalledWith('ui.usagetrackingevent', {
        category: 'Dashboard Widget Action',
        action: 'Investigate',
        label: 'test - My Widget'
      });
      expect(navigateSpy).toHaveBeenCalledWith('target_app', '/:accountId/path', {}, {});
    }));
  });

  describe('based on the default data centre', () => {
    it('should have US as a default for the country for telephone calls to Support', () => {
      expect(component['telCountryDest']).toEqual('us');
    });

    it('should have US set when the datacentre is non-uk', () => {
      jest.spyOn(component['alSession'] as any, 'getActiveDatacenter').mockReturnValue('insight-us-virginia');
      component['setTelCountry']();
      expect(component['telCountryDest']).toEqual('us');
    });

    it('should have UK set when the datacentre is UK', () => {
      jest.spyOn(component['alSession'] as any, 'getActiveDatacenter').mockReturnValue('defender-uk-newport');
      component['setTelCountry']();
      expect(component['telCountryDest']).toEqual('uk');
    });
  });

  describe('when getting own dashboards', () => {
    it('should return a correctly formed response', (() => {
      const resp: DashboardItemsListResponse = {
        dashboard_items: [],
        meta_data: {
          total_count: 0,
          offset: 0,
          limit: 0,
          links: {
            last: 'test',
            next: 'test'
          }
        }
      };

      jest.spyOn(DashboardsClient, 'listOwnDashboardItems').mockReturnValue(Promise.resolve(resp));
      component['getOwnDashboards']().then((response) => {
        expect(response).toEqual(resp);
      });
    }));

    it('should return an error', (() => {
      const resp: Error = new Error();

      jest.spyOn(DashboardsClient, 'listOwnDashboardItems').mockReturnValue(Promise.reject(resp));
      component['getOwnDashboards']().catch((response) => {
        expect(response).toEqual(resp);
      });
    }));
  });

  describe('when a user already has a shared dashboard in their own list as a shared reference item', () => {
    let availableSharedDashboardsResponse = {
      groups: null,
      dashboard_items: [{
        name: 'Dashboard A',
        type: 'dashboard',
        id: '1',
        dashboard: {
          dashboard_layout: {
            index: 0,
            refreshRate: 600
          }
        }
      }]
    };

    // beforeEach(() => {
    //   updateUserDashboardItemsSpy.and.callThrough();
    // });
    it('should not supply any dashboard items for adding as shared refs', () => {
      const ownItems: DashboardItemsListResponse = {
        dashboard_items: [{ type: 'shared_dashboard_ref', shared_dashboard_ref: { id: '1' } }],
        meta_data: {
          total_count: 0,
          offset: 0,
          limit: 0,
          links: {
            last: 'test',
            next: 'test',
          }
        }
      };
      jest.spyOn(component as any, 'getOwnDashboards').mockImplementation(() => Promise.resolve(ownItems));
      jest.spyOn(DashboardsClient, 'listDashboardGroups').mockReturnValue(Promise.resolve(availableSharedDashboardsResponse as DashboardGroupsResponse));
      const updateRefsSpy = jest.spyOn(component['dashboardsService'], 'updateUserSharedDashboardRefs').mockReturnValue(Promise.resolve(true));

      component['updateUserDashboardItems']()
        .then(() => {
          expect(updateRefsSpy.mock.calls[updateRefsSpy.mock.calls.length - 1]).toEqual([]);
          expect(updateRefsSpy.mock.calls.length).toEqual(1);
          expect(1).toEqual(1);
        });
    });
    it('should supply a single dashboard items for adding as shared refs', () => {
      const ownItems: DashboardItemsListResponse = {
        dashboard_items: [],
        meta_data: {
          total_count: 0,
          offset: 0,
          limit: 0,
          links: {
            last: 'test',
            next: 'test',
          }
        }
      };
      jest.spyOn(component as any, 'getOwnDashboards').mockImplementation(() => Promise.resolve(ownItems));
      jest.spyOn(DashboardsClient, 'listDashboardGroups').mockReturnValue(Promise.resolve(availableSharedDashboardsResponse as DashboardGroupsResponse));
      const updateRefsSpy = jest.spyOn(component['dashboardsService'], 'updateUserSharedDashboardRefs').mockReturnValue(Promise.resolve(true));

      component['updateUserDashboardItems']()
        .then(() => {
          const availableDashboards = updateRefsSpy.mock.calls[updateRefsSpy.mock.calls.length - 1];
          expect(availableDashboards.length).toEqual(1);
          expect(availableDashboards).toEqual(availableSharedDashboardsResponse.dashboard_items[0]);
          expect(updateRefsSpy.mock.calls.length).toEqual(1);
        });
    });

    describe('when a user already has a shared dashboard available thats not yet in their own list', () => {
      it('should supply a single dashboard items for adding as shared refs', () => {
        const ownItems: DashboardItemsListResponse = {
          dashboard_items: [{ type: 'shared_dashboard_ref', shared_dashboard_ref: { id: '1' } }],
          meta_data: {
            total_count: 0,
            offset: 0,
            limit: 0,
            links: {
              last: 'test',
              next: 'test'
            }
          }
        };

        availableSharedDashboardsResponse = {
          groups: null,
          dashboard_items: [{
            name: 'Dashboard A',
            type: 'dashboard',
            id: '1',
            dashboard: {
              dashboard_layout: {
                index: 0,
                refreshRate: 600
              }
            }
          }, {
            name: 'Dashboard B',
            type: 'dashboard',
            id: '2',
            dashboard: {
              dashboard_layout: {
                index: 1,
                refreshRate: 600
              }
            }
          }]
        };
        jest.spyOn(DashboardsClient, 'listDashboardGroups').mockImplementation(() => Promise.resolve(availableSharedDashboardsResponse as DashboardGroupsResponse));
        jest.spyOn(component as any, 'getOwnDashboards').mockImplementation(() => Promise.resolve(ownItems));
        const updateRefsSpy = jest.spyOn(component['dashboardsService'], 'updateUserSharedDashboardRefs').mockReturnValue(Promise.resolve(true));

        component['updateUserDashboardItems']()
        .then(() => {
          const availableDashboards = updateRefsSpy.mock.calls[updateRefsSpy.mock.calls.length-1];
          expect(availableDashboards.length).toEqual(1);
          expect(availableDashboards).toEqual(availableSharedDashboardsResponse.dashboard_items[1]);
          expect(updateRefsSpy.mock.calls.length).toEqual(1);
        });
      });
    });
  });

  describe('When the acting account has changed', () => {
    describe('which has ADR entitlements present', () => {
      const dashboardFilters = [{value: {code: 1, id: 'a', name: 'b'}, label: 'x', icon: 'y'}];
      beforeEach(() => {
        isEntitled = true;
        jest.spyOn(component, 'loadDashboard').mockReturnValue(Promise.resolve([]));
        jest.spyOn(component['dashboardsService'], 'generateDashboards').mockImplementation(() => []);
        jest.spyOn(component['dashboardsService'], 'actingAccountHasDashboardEntitlement').mockImplementation(() => true);
        jest.spyOn(component['dashboardsService'], 'generateDashboardFilters').mockImplementation(() => dashboardFilters);
      });
      describe('and dashboards are present for the current user', () => {
        it('should proceed to load the first item from the constructed dashboardFilters', async () => {
          component['currentUserDashboardItems'] = [{
            type: 'shared_dashboard_ref',
            shared_dashboard_ref: {
              id: '1',
              dashboard: {
                dashboard_layout: {
                  meta: {
                    tags: []
                  }
                }
              }
            }
          }];
          await component['onActingAccountResolved'](actingAccountChangedEv);
          expect(component.loadDashboard).toHaveBeenCalledWith(dashboardFilters[0].value.code, true);
        });
      });
      describe('and dashboards are not present for the current user', () => {
        it('should not attempt load any dashboard for display', () => {
          component['currentUserDashboardItems'] = [];
          component['onActingAccountResolved'](actingAccountChangedEv);
          expect(component.loadDashboard).not.toHaveBeenCalled();
        });
      });
    });
  });
  describe('when handling a drill down click event', () => {
    let mockDrillDownClickEvent: CustomEventInit<{buttonAction: WidgetButtonAction, targetApp: string, targetAppPath: string, targetArgs: {[p:string]:string}, event: MouseEvent}>;
    beforeEach(() => {
      mockDrillDownClickEvent = {
        detail: {
          buttonAction: {
          },
          targetApp: 'cd17:incidents',
          targetAppPath: '/#/exposures',
          targetArgs: {
            foo: 'bar'
          },
          event: {} as MouseEvent
        }
      };
      jest.spyOn(component['alNavigation'].navigate as any, 'byLocation');
    });
    it('should invoke a call to the alNavigation service to navigate by location params supplied in the event', () => {
      component.viewFilteredRecords(mockDrillDownClickEvent).then(()=> {
        expect(component['alNavigation'].navigate.byLocation).toHaveBeenCalledWith('cd17:incidents', '/#/exposures', {foo: 'bar'}, {});
      });
    });
    describe('with an aaid arg', () => {
      it('should update the targetAppPath with the aaid value and pass along to the navigateToLocation invocation ', () => {
        mockDrillDownClickEvent.detail.targetArgs['aaid'] = '2';
        mockDrillDownClickEvent.detail.targetAppPath = '/#/exposures/:accountId';
        const account: AIMSAccount = {
          id: '2',
          name:'AL',
          accessible_locations: ['UK'],
          default_location: 'UK',
          active: true,
          created: {by: 'X', at: 0},
          modified: {by: 'X', at: 0}
        };
        jest.spyOn(AlSession, 'getManagedAccounts').mockReturnValue(Promise.resolve([account]));
        component.viewFilteredRecords(mockDrillDownClickEvent).then(()=> {
          expect(component['alNavigation'].navigate.byLocation).toHaveBeenCalledWith('cd17:incidents', '/#/exposures/:accountId', {foo: 'bar'}, { as: { accountId: '2'} });
        });
      });
    });
  });
  describe('On selecting a date range for the last 7 days', () => {
    it('should set the selectedDateRange to span the current date and 7 days prior', () => {
      jest.spyOn(component as any, 'reloadCurrentDashboard').mockImplementation(()=>{});
      const endDate = new Date((new Date()).setHours(23, 59, 59, 999));
      const startDate = new Date((new Date()).setHours(0, 0, 0, 0));
      startDate.setDate(startDate.getDate() - 7);
      component.dateRangeSelectorOnChange('7d');
      expect(component.selectedDateRange).toEqual([startDate, endDate]);
    });
  });
  // describe('On selecting a date', () => {
  //   describe('for when the date picker can only have the start date set', () => {
  //     it('', () => {
  //       component['datePickerFullRangeSelectable'] = true;
  //       component.showDateControls = true;
  //       component.showDateSelectionOptions = true;
  //       component.datePickerMaxDate = new Date();
  //       component.selectDate();
  //       expect(component.selectedDateRange[1]).toEqual(component.datePickerMaxDate);
  //     });

  //   });
  // });
  describe('During a set of resize event', () => {
    beforeEach(() => {
      component.layoutConfig = [{
        id:'1',
        metrics: {
          height:1,
          width:1
        },
        title: 'some widget',
        content: {
          type: WidgetContentType.Count,
          data: {foo: 'bar'}
        }
      }];
      component.resizeStart();
    });
    describe('after the resize start event is triggered', () => {
      it('should set any widgets content in the dashboard layoutConfig to null', () => {
        expect(component.layoutConfig[0].content).toBe(null);
      });
    });
    describe('when the resize end event is triggered', () => {
      it('should restore any widgets content to what it was prior to the resize event starting', () => {
        component.resizeEnd();
        expect(component.layoutConfig[0].content).toEqual({
          type: WidgetContentType.Count,
          data: {foo: 'bar'}
        });
      });
    });
  });
});
