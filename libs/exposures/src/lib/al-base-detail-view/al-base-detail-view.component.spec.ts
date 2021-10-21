import { AlAssetsQueryClient } from "@al/assets-query";
import { AlNavigationService, AlUrlFilterService } from "@al/ng-navigation-components";
import { AppInjector } from "@al/ng-generic-components";
import { AlNavigationServiceMock } from "@al/ng-navigation-components/testing"
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { FiltersUtilityService } from "../services";
import { AlBaseDetailViewComponent } from './al-base-detail-view.component';

const injectorMock = {
    get(token: any) {
        return TestBed.inject(token);
    }
};

class ParentTestComponent extends AlBaseDetailViewComponent {
}

describe('AlBaseDetailViewComponent Test Suite', () => {
    let component: ParentTestComponent;
    let fixture: ComponentFixture<ParentTestComponent>;
    beforeEach((() => {
        AppInjector.setInjector(injectorMock);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: AlNavigationService, useClass: AlNavigationServiceMock },
                AlUrlFilterService,
                FiltersUtilityService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ParentTestComponent);
        component = fixture.componentInstance;
        component.accountId = '2';
        fixture.detectChanges();
    });

    it('It should create component', () => {
        expect(component).toBeTruthy();
    });

    describe('when restoring a remediation item', () => {
        describe('with no restorationItemIds set', () => {
            beforeEach(() => {
                jest.spyOn(AlAssetsQueryClient, 'undisposeRemediationItems').mockReturnValue(Promise.resolve({}));
                component.page = 'exposures';
                component.pageState = 'disposed';
                component.actions = component.getActionButtons();
                component.restorationItemIds = [];
            });
            describe('which has an audit_id present', () => {
                beforeEach(() => {
                    component.remediationItem = {
                        audit_id: 'audit-01'
                    };
                });
                describe('and a vulnerability_id present', () => {
                    it('should perform the undispose operation with correct params', () => {
                        component.remediationItem.vulnerability_id = 'vuln-01';
                        component.restoreRemediationItem();
                        expect(AlAssetsQueryClient.undisposeRemediationItems).toHaveBeenCalledWith('2', {audit_ids: ['audit-01'], vulnerability_ids: ['vuln-01']});
                    });
                });
                describe('and a remediation_id present', () => {
                    it('should perform the undispose operation with correct params', () => {
                        component.remediationItem.remediation_id = 'rem-01';
                        component.restoreRemediationItem();
                        expect(AlAssetsQueryClient.undisposeRemediationItems).toHaveBeenCalledWith('2', {audit_ids: ['audit-01'], remediation_ids: ['rem-01']});
                    });
                });
            });
            describe('which has no audit_id present', () => {
                it('should perform the undispose operation with the remediation item items_ids value only', () => {
                    component.remediationItem = { item_ids: ['item-01']};
                    component.restoreRemediationItem();
                    expect(AlAssetsQueryClient.undisposeRemediationItems).toHaveBeenCalledWith('2', {remediation_item_ids: ['item-01']});
                });
            });
        });
        describe('with remediationItem.applies_to_specific_assets is truthy', () => {
            beforeEach(() => {
                jest.spyOn(AlAssetsQueryClient, 'undisposeRemediations').mockReturnValue(Promise.resolve({}));
                component.page = 'exposures';
                component.pageState = 'disposed';
                component.actions = component.getActionButtons();
                component.remediationItem = { applies_to_specific_assets: true, item_ids: ['item-01', 'item-02']};
            });
            describe('and restorationItemIds set', () => {
                it('should call undisposeRemediations with restorationItemIds supplied as a param', () => {
                    component.restorationItemIds = ['foo', 'bar'];
                    component.restoreRemediationItem();
                    expect(AlAssetsQueryClient.undisposeRemediations).toHaveBeenCalledWith('2', {remediation_item_ids: 'foo,bar'});
                });
            });
            describe('and no restorationItemIds set', () => {
                beforeEach(() => {
                    component.restorationItemIds = [];
                });
                describe('and an audit_id present', () => {
                    beforeEach(() => {
                        component.remediationItem.audit_id = 'audit-01';
                    });
                    it('should perform the undispose operation with the remediation item audit_id only', () => {
                        component.restoreRemediationItem();
                        expect(AlAssetsQueryClient.undisposeRemediations).toHaveBeenCalledWith('2', {audit_ids: 'audit-01'});
                    });
                    describe('and a vulnerability_id present', () => {
                        it('should perform the undispose operation with correct params', () => {
                            component.remediationItem.vulnerability_id = 'vuln-01';
                            component.restoreRemediationItem();
                            expect(AlAssetsQueryClient.undisposeRemediations).toHaveBeenCalledWith('2', {audit_ids: 'audit-01', vulnerability_ids: 'vuln-01'});
                        });
                    });
                    describe('and a remediation_id present', () => {
                        it('should perform the undispose operation with correct params', () => {
                            component.remediationItem.remediation_id = 'rem-01';
                            component.restoreRemediationItem();
                            expect(AlAssetsQueryClient.undisposeRemediations).toHaveBeenCalledWith('2', {audit_ids: 'audit-01', remediation_ids: 'rem-01'});
                        });
                    });
                });
                describe('and no audit_id present', () => {
                    it('should perform the undispose operation with the remediation item items_ids value only', () => {
                        delete component.remediationItem.audit_id;
                        component.restoreRemediationItem();
                        expect(AlAssetsQueryClient.undisposeRemediations).toHaveBeenCalledWith('2', {remediation_item_ids: 'item-01,item-02'});
                    });
                });
            });

        });

    });
});
