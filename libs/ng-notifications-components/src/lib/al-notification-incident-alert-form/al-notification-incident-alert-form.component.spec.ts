/**
 * Test suite for AlNotificationReportScheduleFormComponent
 */
import { AlSession, AIMSClient, AIMSUser } from '@al/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgGenericComponentsModule } from '@al/ng-generic-components';

import { AlAggregationFilterContentComponent } from '../al-aggregation-filter-content/al-aggregation-filter-content.component';
import { AlCadenceSelectorComponent } from '../al-cadence-selector/al-cadence-selector.component';
import { AlNotificationFormComponent } from '../al-notification-form/al-notification-form.component';
import { AlNotificationIncidentAlertFormComponent } from './al-notification-incident-alert-form.component';
import { AlGenericAlertOptions, ALGestaltNotifications } from '@al/gestalt';
import { AlHeraldNotificationType, AlHeraldClientV2 } from '@al/herald';
import { AlNavigationService } from '@al/ng-navigation-components';


// TODO: fix me post angular 9, it is making a network request in the startup
xdescribe('AlNotificationIncidentAlertFormComponent', () => {
    let component: AlNotificationIncidentAlertFormComponent;
    let fixture: ComponentFixture<AlNotificationIncidentAlertFormComponent>;

    // Mocks definitions.
    const gestaltOptionsMock:AlGenericAlertOptions = require("../../testing/gestalt-schedule-options-mock.json") as AlGenericAlertOptions;
    const incidentsGestaltOptionsMock:Promise<AlGenericAlertOptions> = Promise.resolve(gestaltOptionsMock);
    const usersMock:AIMSUser[] = require("../../testing/users-mock.json").users;
    const notificationTypesMock:AlHeraldNotificationType[] = require("../../testing/herald-notifications-types-mock.json").notification_types;
    const currentUserMock:AIMSUser = usersMock[0];

    beforeEach(waitForAsync(() => {
        jest.spyOn(AlSession, "getUser").mockReturnValue(currentUserMock);
        jest.spyOn(AlHeraldClientV2,"getAllNotificationTypes").mockReturnValue(Promise.resolve(notificationTypesMock));
        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                CalendarModule,
                CheckboxModule,
                DropdownModule,
                FormsModule,
                InputSwitchModule,
                InputTextModule,
                NgGenericComponentsModule,
                PanelModule,
            ],
            providers: [{
                provide: AlNavigationService, useValue: {
                    evaluateEntitlementExpression: () => false
                }
            }],
            declarations: [
                AlAggregationFilterContentComponent,
                AlCadenceSelectorComponent,
                AlNotificationIncidentAlertFormComponent,
                AlNotificationFormComponent,
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlNotificationIncidentAlertFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('When the component is initiated', () => {
        it('Should build - smoke test', () => {
            component.ngOnInit();
        });
    });

    describe('When the form opens', () => {
        beforeEach(() => {
            jest.spyOn(AIMSClient,"getAccountsIdsByRelationship").mockReturnValue(Promise.resolve(["2"]));
            jest.spyOn(AIMSClient,"getUsersFromAccounts").mockReturnValue(Promise.resolve(usersMock));
            jest.spyOn(ALGestaltNotifications, "getGenericAlertOptions").mockReturnValue(incidentsGestaltOptionsMock);
            component.openAddAlertModal();
            fixture.detectChanges();
        });
        describe('And during the processing of gestalt options',()=>{
            beforeEach(async () => {
                await component.processIncidentAlertOptions(gestaltOptionsMock, 'incident', undefined);
            });
            it('Should set the integrations and the users', async () => {
                expect(component.notificationForm.allSelectableUsers.length).toEqual(29);
                expect(component.notificationForm.allSelectableIntegrations.length).toEqual(2);
            });
            it('Should set the fake accounts as the first elements of the list', () => {
                expect(component.allSelectableAccounts[0].value.value.id).toEqual(component.dictionaries.getManagedAccountsFakeId());
                expect(component.allSelectableAccounts[0].value.value.name).toEqual(component.dictionaries.getTextManagedAccounts());
                expect(component.allSelectableAccounts[1].value.value.id).toEqual(component.dictionaries.getMyAccountsAndManagedFakeId());
                expect(component.allSelectableAccounts[1].value.value.name).toEqual(component.dictionaries.getTextMyAccountsAndManaged());
            });
        });
        describe('And incident alert name contains spaces',() => {
            it('Should not enable the save button',() => {
                component.form.incidentAlertName = ' ';
                component.validateForm();
                if (component.headerOptions.primaryAction) {
                    expect(component.headerOptions.primaryAction.disabled).toBeTruthy();
                } else {
                    fail();
                }
            });
        });
    });
});
