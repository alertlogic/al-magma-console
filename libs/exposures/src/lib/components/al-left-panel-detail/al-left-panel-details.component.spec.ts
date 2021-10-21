import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { AIMSClient } from '@al/core';
import { AlLeftPanelDetailComponent } from './al-left-panel-detail.component';
import { RemediationItemAsset } from '@al/assets-query';
import { AppConstants } from '../../constants';

@Component({
    selector: 'test-component',
    template: `<al-left-panel-detail [descriptor]="leftPanelDescriptor"
    [remediationItem]="remediationItem" [accountId]="'134249236'" [state]="pageState"></al-left-panel-detail>`,
})

class TestLeftPanelDetailComponent {

    public remediationItem: RemediationItemAsset;
    public leftPanelDescriptor: AppConstants.LeftPanelDetailDescriptor;
    public pageState = "disposed";
    constructor() { }
}

const getUserDetailsByUserId = require('../../../../testing/mocks/aims/user-detail-by-user-id.json');
describe('AlLeftPanelDetailComponent', () => {
    let component: AlLeftPanelDetailComponent;
    let fixture: ComponentFixture<TestLeftPanelDetailComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AlLeftPanelDetailComponent, TestLeftPanelDetailComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents();
        fixture = TestBed.createComponent(TestLeftPanelDetailComponent);
        component = fixture.debugElement.children[0].componentInstance;

    });


    it('SHOULD create a component', () => {

        expect(component).toBeTruthy();
    });


    describe('When ngOnInit called ', () => {

        it('SHOULD set User detail to show remedition detail in disposed/conclude state', async () => {

            component.remediationItem = {
                user_id: "F1EDB47E-C7AB-4283-AFEF-91AAD07BAE0F",
                state: 'disposed',
                reason: "acceptable_risk",
                comment: "No comments",
                modified_on: 1595326950796,
                type: "remediation-item"
            };

            component.descriptor = new AppConstants.LeftPanelDetailDescriptor();
            jest.spyOn(AIMSClient, 'getUserDetailsByUserId').mockImplementation(() => Promise.resolve(getUserDetailsByUserId));
            await component.ngOnInit();
            expect(component.remediationItemData.assessedBy).toEqual('Robert Parker');
            expect(component.remediationItemData.comments).toEqual('No comments');

        });

    });

    it('SHOULD set a state when changeState called', () => {
        component.changeState("concluded");
        expect(component.state).toEqual("concluded");
    });


});

