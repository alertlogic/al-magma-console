import {
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
import { AlRemediationAssetItemComponent } from './al-remediation-asset-item.component';

describe('AlRemediationAssetItemComponent', () => {
    let component: AlRemediationAssetItemComponent;
    let fixture: ComponentFixture<AlRemediationAssetItemComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ AlRemediationAssetItemComponent ]
        }).compileComponents();
        fixture = TestBed.createComponent(AlRemediationAssetItemComponent);
        component = fixture.componentInstance;
        component.iconClass = "high";
        component.name = "Remediation custom name";
        component.score = 5.4;
    });

    describe('WHEN getIcon is called',() => {
        it('should retrieve the rigth css when high', () => {
            component.iconClass = "high";
            expect(component.getIcon()).toEqual('al al-risk-1 risk critical');
        });
        it('should retrieve the rigth css when medium', () => {
            component.iconClass = "medium";
            expect(component.getIcon()).toEqual('al al-risk-2 risk high');
        });
        it('should retrieve the rigth css when low', () => {
            component.iconClass = "low";
            expect(component.getIcon()).toEqual('al al-risk-3 risk medium');
        });
        it('should retrieve the rigth css when info', () => {
            component.iconClass = "info";
            expect(component.getIcon()).toEqual('al al-risk-1 risk low');
        });
        it('should retrieve the rigth css when none', () => {
            component.iconClass = "none";
            expect(component.getIcon()).toEqual('al al-risk-4 risk info');
        });
        it('should retrieve the same css icon class by default if not match a remediation level', () => {
            component.iconClass = "myCustomIconClass";
            expect(component.getIcon()).toEqual('myCustomIconClass');
        });
    });
});
