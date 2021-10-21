/**
 * Test suite for AlNotificationReportScheduleFormComponent
 */
import { AlSession, AIMSClient, AIMSUser } from '@al/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { NgGenericComponentsModule } from '@al/ng-generic-components';

import { AlAggregationFilterContentComponent } from '../al-aggregation-filter-content/al-aggregation-filter-content.component';
import { AlCadenceSelectorComponent } from '../al-cadence-selector/al-cadence-selector.component';
import { AlNotificationFormComponent } from '../al-notification-form/al-notification-form.component';
import { AlNotificationReportScheduleFormComponent } from './al-notification-report-schedule-form.component';
import { AlTableauScheduledReport, TableauReportDefinitionV2 } from '@al/cargo';
import { AlGenericAlertOptions, ALGestaltNotifications } from '@al/gestalt';
import { AlHeraldNotificationType, AlHeraldClientV2 } from '@al/herald';
import { AlNavigationService } from '@al/ng-navigation-components';
import { AlScheduleReportFormComponent } from '../al-schedule-report-form/al-schedule-report-form.component';
import { AlSuggestionsClientV2, AlSuggestionsTemplateResponseV2, AlSavedQueryV2 } from '@al/suggestions';

describe('AlNotificationReportScheduleFormComponent', () => {
    let component: AlNotificationReportScheduleFormComponent;
    let fixture: ComponentFixture<AlNotificationReportScheduleFormComponent>;

    // Mocks definitions.
    const frequenciesMock:string[] = ["monthly","weekly","daily"];
    const emailSubjectMock:string = "Scheduled Report {{schedule_name}} was generated";
    const emailSubjectPromise:Promise<string> = Promise.resolve(emailSubjectMock);

    const scheduleTableauData:TableauReportDefinitionV2 = require("../../testing/schedule-tableau-report-mock.json").reportDefinition;
    let scheduleTableauReportMock:AlTableauScheduledReport = new AlTableauScheduledReport();
    scheduleTableauReportMock.setViewDefinition(
        scheduleTableauData.site_id as string,
        scheduleTableauData.workbook_id as string,
        scheduleTableauData.view_id as string,
    );
    scheduleTableauReportMock.setFormat("pdf");

    const gestaltOptionsMock:AlGenericAlertOptions = require("../../testing/gestalt-schedule-options-mock.json") as AlGenericAlertOptions;
    const scheduleGestaltOptionsMock:Promise<AlGenericAlertOptions> = Promise.resolve(gestaltOptionsMock);
    const usersMock:AIMSUser[] = require("../../testing/users-mock.json").users;
    const notificationTypesMock:AlHeraldNotificationType[] = require("../../testing/herald-notifications-types-mock.json").notification_types;
    const fimTemplatesMock:AlSuggestionsTemplateResponseV2[] = require("../../testing/fim-templates-mock.json").templates;
    const savedQueryMock:AlSavedQueryV2 = require("../../testing/saved-query-mock.json");
    const currentUserMock:AIMSUser = usersMock[0];

    beforeEach(() => {
        jest.spyOn(AlSession, "getUser").mockReturnValue(currentUserMock);
        jest.spyOn(AlHeraldClientV2, "getAllNotificationTypes").mockReturnValue(Promise.resolve(notificationTypesMock));
        jest.spyOn(AlSuggestionsClientV2, "getQueryTemplates").mockReturnValue(Promise.resolve(fimTemplatesMock));
        jest.spyOn(AlSuggestionsClientV2, "createSavedQuery").mockReturnValue(Promise.resolve(savedQueryMock));
        jest.spyOn(AlSuggestionsClientV2, "getSavedQuery").mockReturnValue(Promise.resolve(savedQueryMock));
        jest.spyOn(AlSuggestionsClientV2, "updateSavedQuery").mockReturnValue(Promise.resolve(savedQueryMock));
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
                ReactiveFormsModule,
            ],
            providers: [{
                provide: AlNavigationService, useValue: {
                    evaluateEntitlementExpression: () => false,
                    isExperienceAvailable: () => false
                }
            }],
            declarations: [
                AlAggregationFilterContentComponent,
                AlCadenceSelectorComponent,
                AlNotificationReportScheduleFormComponent,
                AlNotificationFormComponent,
                AlScheduleReportFormComponent,
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(AlNotificationReportScheduleFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('When the component is initiated', () => {
        it('Should build - smoke test', () => {
            component.ngOnInit();
        });
    });

    describe('When the form opens', () => {
        let templateSpy: jest.SpyInstance;

        beforeEach(() => {
            jest.spyOn(AIMSClient,"getAccountsIdsByRelationship").mockReturnValue(Promise.resolve(["2"]));
            jest.spyOn(AIMSClient,"getUsersFromAccounts").mockReturnValue(Promise.resolve(usersMock));
            templateSpy = jest.spyOn(component.dictionaries, "getEmailSubjectTemplate").mockReturnValue(emailSubjectPromise);
            jest.spyOn(ALGestaltNotifications, "getGenericAlertOptions").mockReturnValue(scheduleGestaltOptionsMock);
        });
        xdescribe('And externally receives a tableau report object and frequencies',() =>{
            beforeEach(() => {
                component.openModal(scheduleTableauReportMock.getScheduledReport(), frequenciesMock);
                fixture.detectChanges();
            });
            it('Should display the adecuate tableau email subject template', () => {
                expect(templateSpy).toHaveBeenCalledWith('tableau/notifications');
                emailSubjectPromise.then(() => {
                    expect(component.notificationForm.emailSubject).toEqual(emailSubjectMock);
                });
            });
            it('Should cadence be build according to frequencies', () => {
                expect(component.cadence.hasOwnProperty('daily')).toBeTruthy();
            });
        });
        describe('And during the processing of gestalt options',()=>{
            beforeEach(async () => {
                await component.processIncidentAlertOptions(gestaltOptionsMock, 'scheduled_report');
            });
            it('Should set the integrations and the users', async () => {
                expect(component.notificationForm.allSelectableUsers.length).toEqual(29);
                expect(component.notificationForm.allSelectableIntegrations.length).toEqual(2);
            });
        });
        xdescribe('And report name contains spaces',() => {
            it('Should not enable the save button',() => {
                component.reportName = ' ';
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

