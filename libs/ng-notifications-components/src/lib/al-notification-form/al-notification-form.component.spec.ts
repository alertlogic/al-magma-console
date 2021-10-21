/**
 * Test suite for AlNotificationFormComponent
 */
import { AlSession, AIMSUser } from '@al/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { NgGenericComponentsModule, AlSelectItem } from '@al/ng-generic-components';

import { AlNotificationFormComponent } from './al-notification-form.component';
import { AlHeraldSubscribersV2 } from '@al/herald';
import { AlNavigationService } from '@al/ng-navigation-components';

describe('AlNotificationFormComponent', () => {
    let component: AlNotificationFormComponent;
    let fixture: ComponentFixture<AlNotificationFormComponent>;
    const usersMock:AIMSUser[] = require("../../testing/users-mock.json").users;
    const currentUserMock:AIMSUser = usersMock[0];

    beforeEach(waitForAsync(() => {
        jest.spyOn(AlSession, "getUser").mockReturnValue(currentUserMock);
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                NgGenericComponentsModule,
                DropdownModule,
                CheckboxModule,
            ],
            providers: [{
                provide: AlNavigationService,
                useValue: {
                    evaluateEntitlementExpression: () => true,
                    isExperienceAvailable: () => true
                }
            }],
            declarations: [ AlNotificationFormComponent ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlNotificationFormComponent);
        component = fixture.componentInstance;
        jest.spyOn(component, "loadIntegrationTypes").mockImplementation( async () => {
            component.integrationTypesDictionary = {
                "webhook":"Webhook"
            };
        });
        fixture.detectChanges();
    });

    describe('When the component is initiated', () => {
        it('Should build - smoke test', () => {
            component.ngOnInit();
        });
    });

    describe('When users are setup to the component', () => {
        beforeEach(() => {
            component.accountId = "2";
            fixture.detectChanges();
        });
        describe('And user is in create mode', () => {
            beforeEach(() => {
                component.editMode = false;
                component.setSelectableUsers(usersMock);
                fixture.detectChanges();
            });
            it('Should set the creator as default', () => {
                const creator = component.selectedUsers[0];
                const subtitleText = `${currentUserMock.email} ${component.getUserLabel(currentUserMock.id as string)}`;
                expect(creator).toEqual({
                    title: currentUserMock.name,
                    subtitle: subtitleText,
                    value: currentUserMock,
                } as AlSelectItem);
            });
        });
        describe('And user is in edit mode', () => {
            beforeEach(() => {
                component.editMode = true;
                component.setSelectableUsers(usersMock);
                fixture.detectChanges();
            });
            it('Should set the creator as default then change it to the real subscribers', () => {
                expect(component.selectedUsers.length).toEqual(1);
            });
            it('Should set the original subscriber as the creator', () => {
                component.editUserCreator = 'B17B7242-DCAB-407C-B418-4CAA8F16F271';
                const user1 = usersMock[0] as AIMSUser;
                const userCreator:AIMSUser = component.getUserById(component.editUserCreator);
                const subscribers: AlHeraldSubscribersV2[] = [
                    {
                        subscriber: user1.id + "",
                        subscriber_type: "user",
                        subscription_id: "SUBSCRIBER_ID1",
                        id: "SUBSCRIBER_ID1"
                    },
                    {
                        subscriber: component.editUserCreator,
                        subscriber_type: "user",
                        subscription_id: "THE_CREATOR_ID",
                        id: "THE_CREATOR_ID"
                    },
                ];
                component.setSubscribers(subscribers);
                expect(component.selectedUsers.length).toEqual(2);
                expect(component.selectedUsers[1].subtitle).toEqual(`${userCreator.email} ${component.getUserLabel(userCreator.id as string)}`);
            });
        });
    });
});

