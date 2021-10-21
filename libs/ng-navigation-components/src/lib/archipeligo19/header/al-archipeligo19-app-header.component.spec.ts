import {
    AIMSAccount,
    AlActingAccountResolvedEvent,
    AlEntitlementCollection,
    AlSession,
    AlSessionStartedEvent,
} from '@al/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import {
    ConfirmationService,
    MenuItem,
} from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

import { AlArchipeligo19AppHeaderComponent } from './al-archipeligo19-app-header.component';

describe('AlAppHeaderComponent Test Suite', () => {
  let component: AlArchipeligo19AppHeaderComponent;
  let fixture: ComponentFixture<AlArchipeligo19AppHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
             declarations: [AlArchipeligo19AppHeaderComponent],
             imports: [
               ConfirmDialogModule, MenuModule, MenubarModule, TooltipModule, ProgressSpinnerModule,
               NgSelectModule, FormsModule,
               HttpClientTestingModule,
               RouterTestingModule.withRoutes( [] )
             ],
             providers: [ ConfirmationService ]
           })
           .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlArchipeligo19AppHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  describe('When a session has started', () => {
    it('should set authenticated to true', () => {
      const sessionStartedEvent: AlSessionStartedEvent = new AlSessionStartedEvent(
        {
          name: 'Peter Pan',
          email: 'peter@pan.com',
          created: {
            at: 1,
            by: 'blaa'
          },
          modified: {
            at: 1,
            by: 'blaa'
          },
          linked_users: []
        },
        {
          name: 'Foo',
          id: '1',
          active: true,
          default_location: 'Cardiff',
          accessible_locations: [],
          created: {
            at: 1,
            by: 'blaaa'
          },
          modified: {
            at: 1,
            by: 'blaa'
          }
        });
      component.onSessionStart(sessionStartedEvent);
      expect(component.authenticated).toEqual(true);
      expect(component.userMenuItems[0].label).toEqual(sessionStartedEvent.user.name);
    });
  });
  describe('On resolving an acting account that manages one other account', () => {
    const primaryAccount: AIMSAccount = {
      id: '2',
      name: 'AL',
      active: true,
      accessible_locations: [],
      default_location: 'Cardiff',
      created: {
        at: 1,
        by: 'blaaa'
      },
      modified: {
        at: 1,
        by: 'blaa'
      }

    };
    const event: AlActingAccountResolvedEvent = new AlActingAccountResolvedEvent(
      primaryAccount,
      new AlEntitlementCollection(),
      new AlEntitlementCollection()
    );
    beforeEach(() => {
      jest.spyOn(AlSession, 'getPrimaryAccount').mockReturnValue(primaryAccount);
      component.onActingAccountResolved(event);
    });
    it('shoud initialise the acting account component properties', () => {
      expect(component.actingAccount).toEqual(event.actingAccount);
      expect(component.actingAccountId).toEqual(event.actingAccount.id);
    });
    it('shoud initialise the managedAccounts component properties', () => {
      expect(component.actingAccount).toEqual(event.actingAccount);
      expect(component.actingAccountId).toEqual(event.actingAccount.id);
    });
  });
  describe('When calling logout', () => {
    it('should call deactivateSession on the AlSession instance', () => {
      jest.spyOn(AlSession, 'deactivateSession').mockImplementation(() => {
        // empty intentional
        return true;
      });
      jest.spyOn(component.alNavigation.navigate, 'byLocation').mockImplementation(() => {
        // empty intentional
      });
      component.logout();
      expect(AlSession.deactivateSession).toHaveBeenCalled();
    });
  });
  describe('When the selected account has changed', () => {
    describe('and the account value is valid', () => {
      it('should call setActingAccount() on the AlNavigationService instance', () => {
        const accountId = '2';
        jest.spyOn(component.alNavigation, 'setActingAccount').mockImplementation(() => {
          // empty intentional
          return Promise.resolve( true );
        });

        component.actingAccountId = accountId;      //  <ng-select>'s bind property causes this value to be updated by change events
        component.onAccountChanged();

        expect(component.alNavigation.setActingAccount).toHaveBeenCalledWith(accountId);
      });
    });
  });
  describe('When checking if an account matches a search term', () => {
    const account: AIMSAccount = {
      id: '2',
      name: 'Alert Logic, Inc',
      active: true,
      accessible_locations: [],
      default_location: 'Cardiff',
      created: {
        at: 1,
        by: 'blaaa'
      },
      modified: {
        at: 1,
        by: 'blaa'
      }
    };
    describe('and the account name contains the term', () => {
      it('should return a truthy match', () => {
        const searchTerm = 'Alert';
        expect(component.accountSearchFn(searchTerm, account)).toEqual(true);
      });
    });
    describe('and the account id starts with the term', () => {
      it('should return a truthy match', () => {
        const searchTerm = '2';
        expect(component.accountSearchFn(searchTerm, account)).toEqual(true);
      });
    });
    describe('and the account name does not contain the term', () => {
      it('should return a falsy match', () => {
        const searchTerm = 'SRE';
        expect(component.accountSearchFn(searchTerm, account)).toEqual(false);
      });
    });
  });
  describe('On invoking the command associated to the Logout user menu item', () => {
    it('should call the component logout function', () => {
      jest.spyOn(component, 'logout').mockImplementation(() => {
        // empty intentional
      });
      const logoutItem = component.userMenuItems[0].items[0] as MenuItem;
      logoutItem.command();
      expect(component.logout).toHaveBeenCalled();
    });
  });
});
