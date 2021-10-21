/**
 * Test suite for AlNotificationReportScheduleFormComponent
 */
import { AlSession, AIMSUser } from '@al/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {
    ActivatedRoute,
    Router,
    convertToParamMap,
} from '@angular/router';

import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { SlideMenuModule } from 'primeng/slidemenu';

import {
    NgGenericComponentsModule,
} from '@al/ng-generic-components';
import {
    CommonModule,
} from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { NgCardstackModule } from '@al/ng-cardstack-components';

import { of as observableOf } from 'rxjs';

import { AlAggregationFilterContentComponent } from '../al-aggregation-filter-content/al-aggregation-filter-content.component';
import { AlCadenceSelectorComponent } from '../al-cadence-selector/al-cadence-selector.component';
import { AlNotificationIncidentAlertFormComponent } from '../al-notification-incident-alert-form/al-notification-incident-alert-form.component';
import { AlNotificationContentComponent } from '../al-notification-content/al-notification-content.component';
import { AlNotificationFormComponent } from '../al-notification-form/al-notification-form.component';
import { AlNotificationsListComponent } from './al-notifications-list.component';
import { AlNotificationReportScheduleFormComponent } from '../al-notification-report-schedule-form/al-notification-report-schedule-form.component';
import { AlHeraldClientV2, AlHeraldAccountSubscriptionV2, AlHeraldNotificationType } from '@al/herald';
import { ALCargoV2, ScheduledReportV2 } from '@al/cargo';
import { AlScheduleReportFormComponent } from '../al-schedule-report-form/al-schedule-report-form.component';
import { AlSuggestionsClientV2, AlSavedQueryV2, AlSuggestionsTemplateResponseV2 } from '@al/suggestions';

// TODO: fix me post angular 9, it is making a network request somewhere
xdescribe('AlNotificationsListComponent', () => {
    let component: AlNotificationsListComponent;
    let fixture: ComponentFixture<AlNotificationsListComponent>;

    const usersMock:AIMSUser[] = require("../../testing/users-mock.json").users;
    const currentUserMock:AIMSUser = usersMock[0];
    const heraldSubscriptionMock:AlHeraldAccountSubscriptionV2 = require("../../testing/herald-subscription-accounts-mock.json");
    const cargoScheduleReportMock:ScheduledReportV2 = require("../../testing/cargo-schedule-report-mock.json");
    const savedQueryMock:AlSavedQueryV2 = require("../../testing/saved-query-mock.json");
    const fimTemplatesMock:AlSuggestionsTemplateResponseV2[] = require("../../testing/fim-templates-mock.json").templates;
    const entityMockIncidents = require("../../testing/card-alert-definition-incidents-mock.json");
    const entityMockSchedule = require("../../testing/card-alert-definition-schedules-mock.json");
    const notificationTypesMock:AlHeraldNotificationType[] = require("../../testing/herald-notifications-types-mock.json").notification_types;
    beforeEach(waitForAsync(() => {
        jest.spyOn(AlSession, "getUser").mockReturnValue(currentUserMock);
        jest.spyOn(AlHeraldClientV2, "getAllNotificationTypes").mockReturnValue(Promise.resolve(notificationTypesMock));
        jest.spyOn(AlSuggestionsClientV2, "getSavedQuery").mockReturnValue(Promise.resolve(savedQueryMock));
        jest.spyOn(AlSuggestionsClientV2, "getQueryTemplates").mockReturnValue(Promise.resolve(fimTemplatesMock));
        const mockRouter = {
            navigate: jest.fn(),
            events: observableOf(new Event("test")),
        };
        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                ConfirmDialogModule,
                CalendarModule,
                CheckboxModule,
                CommonModule,
                DropdownModule,
                FormsModule,
                InputSwitchModule,
                InputTextModule,
                NgCardstackModule,
                NgGenericComponentsModule,
                PanelModule,
                SlideMenuModule,
                ReactiveFormsModule,
            ],
            declarations: [
                AlAggregationFilterContentComponent,
                AlCadenceSelectorComponent,
                AlNotificationContentComponent,
                AlNotificationsListComponent,
                AlNotificationFormComponent,
                AlNotificationIncidentAlertFormComponent,
                AlNotificationReportScheduleFormComponent,
                AlScheduleReportFormComponent,
            ],
            providers:  [
                { provide: Router, useValue: mockRouter },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: observableOf({
                            accountId: '2', aaid: '2',
                            has: function () { return false; }
                        }),
                        paramMap: observableOf(convertToParamMap({ accountId: '2', aaid: '2' })),
                        queryParamMap: observableOf(convertToParamMap({ accountId: '2', aaid: '2' })),
                        snapshot:{ queryParamMap :convertToParamMap({ accountId:'2' }) },
                    },
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlNotificationsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('When user clicks on edit over a notification card',() => {
        beforeEach(() => {
            jest.spyOn(AlHeraldClientV2,'getSubscriptionByAccountAndSubscriptionId').mockReturnValue(Promise.resolve(heraldSubscriptionMock));
            jest.spyOn(ALCargoV2,'getSchedule').mockReturnValue(Promise.resolve(cargoScheduleReportMock));
        });
        describe('And it is an incident alert',() => {
            let spyIncidentForm: jest.SpyInstance;
            beforeEach(() => {
                spyIncidentForm = jest.spyOn(component.createIncidentAlert,'editAlertModal');
                component.viewName = "incident";
                component.ngOnInit();
                fixture.detectChanges();
            });
            it('Should open the incident alert form for editing',async () => {
                await component.editAlert(entityMockIncidents);
                fixture.detectChanges();
                expect(spyIncidentForm).toHaveBeenCalled();
            });
        });
        describe('And it is a scheduled report',() => {
            let spyReportForm: jest.SpyInstance;
            beforeEach(() => {
                spyReportForm = jest.spyOn(component.reportScheduleForm,'editModal');
                component.viewName = "scheduled_report";
                component.ngOnInit();
                fixture.detectChanges();
            });
            it('Should open the scheduled report form for editing',async () => {
                await component.editAlert(entityMockSchedule);
                fixture.detectChanges();
                expect(spyReportForm).toHaveBeenCalled();
            });
        });
    });
});

