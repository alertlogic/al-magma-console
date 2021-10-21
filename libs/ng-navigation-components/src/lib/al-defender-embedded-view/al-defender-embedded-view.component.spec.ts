import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AlDefenderEmbeddedViewComponent } from './al-defender-embedded-view.component';
import { AlNavigationService } from '../services/al-navigation.service';
import { AlNavigationServiceMock } from '../../testing/al-navigation.service-mock';

// TODO: fix me post angular 9
xdescribe('AlDefenderEmbeddedViewComponent', () => {
    let component: AlDefenderEmbeddedViewComponent;
    let fixture: ComponentFixture<AlDefenderEmbeddedViewComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ AlDefenderEmbeddedViewComponent ],
            schemas: [ NO_ERRORS_SCHEMA ],
            providers: [ { provide: AlNavigationService, useClass: AlNavigationServiceMock } ]
        }).compileComponents();
        fixture = TestBed.createComponent(AlDefenderEmbeddedViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
