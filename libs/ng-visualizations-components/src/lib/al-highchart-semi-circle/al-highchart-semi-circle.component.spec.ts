import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlHighchartSemiCircleComponent } from './al-highchart-semi-circle.component';
import { SimpleChange } from '@angular/core';

describe('AlHighchartSemiCircleComponent', () => {
  let component: AlHighchartSemiCircleComponent;
  let fixture: ComponentFixture<AlHighchartSemiCircleComponent>;
  const config: {series: any[]; categories: string; title: string} = { title: '', series: [], categories: '' };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlHighchartSemiCircleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlHighchartSemiCircleComponent);
    component = fixture.componentInstance;
    component.config = config;
    component.ngOnChanges({
      config: new SimpleChange(undefined, config, true)
    });
    fixture.detectChanges();

  });

  describe('When the component detects input changes', () => {
    describe('And there is a config object present', () => {
      it('Should call to populate the components configuration', () => {
        const mySpy = jest.spyOn(component as any, 'populateConfig');
        component.ngOnChanges({
          config: new SimpleChange(undefined, config, true)
        });
        expect(mySpy).toHaveBeenCalled();
      });
    });
    describe('And the config is undefined', () => {
      it('Should call to update the components series', () => {
        const mySpy = jest.spyOn(component as any, 'updateSeries');
        component.ngOnChanges({
          config: new SimpleChange(undefined, undefined, true)
        });
        expect(mySpy).toHaveBeenCalled();
      });
    });
  });
});
