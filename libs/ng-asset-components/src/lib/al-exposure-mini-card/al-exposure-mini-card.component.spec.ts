import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from '@angular/core/testing';
import { AlExposureMiniCardComponent } from '../al-exposure-mini-card/al-exposure-mini-card.component';

describe('AlExposureMiniCardComponent', () => {
    let component: AlExposureMiniCardComponent;
    let fixture: ComponentFixture<AlExposureMiniCardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ AlExposureMiniCardComponent ]
        }).compileComponents();
        fixture = TestBed.createComponent(AlExposureMiniCardComponent);
        component = fixture.componentInstance;
        jest.spyOn(component.onExpand,'emit');
    });

    it('should create the component without failing', () => {
        expect(component).toBeTruthy();
    });

    it('WHEN mini card is expanded should emit an expand event', fakeAsync(() => {
        component.expandToggle({stopPropagation: function () {
            // Mock the event and do nothing during the propagation.
        }});
        tick();
        expect(component.onExpand.emit).toHaveBeenCalled();
    }));

    it('WHEN mini card is marked as not expandable should NOT expand', fakeAsync(() => {
        component.expandable = false;
        component.expandToggle({stopPropagation: function () {
            // Mock the event and do nothing during the propagation.
        }});
        tick();
        expect(component.expanded).toBeFalsy();
    }));
});
