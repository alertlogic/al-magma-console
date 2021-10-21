import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlCountSummaryComponent } from './al-count-summary.component';
import { NO_ERRORS_SCHEMA, Component, ViewChild } from '@angular/core';
import { CountSummaryData, CountSummaryChangeDirection, CountSummaryPresentation } from '../types';

@Component({
    template: `
      <al-count-summary
        [data]="data" [presentation]="presentation">
      </al-count-summary>`
})
class TestHostComponent {
    @ViewChild(AlCountSummaryComponent, {static:true})
    alCountSummary: AlCountSummaryComponent;

    data: CountSummaryData = null;
    presentation: CountSummaryPresentation = null;
}

describe('AlCountSummaryComponent Test Suite:', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let data: CountSummaryData;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlCountSummaryComponent, TestHostComponent ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
  });
  describe('When the component data @Input value changes', () => {
    describe('containing a changeCount greater that zero', () => {
        it('should set the changeDirection to Up', () => {
            data = {
                primaryCount: 10,
                changeCount: 5
            };
            hostComponent.data = data;
            hostComponent.presentation = null;
            fixture.detectChanges();
            expect(hostComponent.alCountSummary.changeDirection).toEqual(CountSummaryChangeDirection.Up);
        });
    });
    describe('containing a changeCount less than zero', () => {
        it('should set the changeDirection to Down', () => {
            data = {
                primaryCount: 10,
                changeCount: -3
            };
            hostComponent.data = data;
            hostComponent.presentation = null;
            fixture.detectChanges();
            expect(hostComponent.alCountSummary.changeDirection).toEqual(CountSummaryChangeDirection.Down);
        });
    });
    describe('containing a changeCount equal to zero', () => {
        it('should set the changeDirection to Flat', () => {
            data = {
                primaryCount: 10,
                changeCount: 0
            };
            hostComponent.data = data;
            hostComponent.presentation = null;
            fixture.detectChanges();
            expect(hostComponent.alCountSummary.changeDirection).toEqual(CountSummaryChangeDirection.Flat);
        });
    });
  });
});
