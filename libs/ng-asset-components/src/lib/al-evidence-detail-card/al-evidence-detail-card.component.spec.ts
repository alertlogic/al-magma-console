import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from '@angular/core/testing';
import { AlEvidenceDetailCardComponent } from './al-evidence-detail-card.component';
import { AlExposureMiniCardComponent } from '../al-exposure-mini-card/al-exposure-mini-card.component';

describe('AlEvidenceDetailCardComponent', () => {
    let component: AlEvidenceDetailCardComponent;
    let fixture: ComponentFixture<AlEvidenceDetailCardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ AlEvidenceDetailCardComponent, AlExposureMiniCardComponent ]
        }).compileComponents();
        fixture = TestBed.createComponent(AlEvidenceDetailCardComponent);
        component = fixture.componentInstance;
        jest.spyOn(component.onExpand,'emit');
    });

    it('should create the component without failing', () => {
        expect(component).toBeTruthy();
    });

    it('WHEN asset card is expanded should emit an expand event', fakeAsync(() => {
        component.toggleEvidenceDetails({stopPropagation: function () {
            // Mock the event and do nothing during the propagation.
        }});
        tick();
        expect(component.onExpand.emit).toHaveBeenCalled();
    }));
});
