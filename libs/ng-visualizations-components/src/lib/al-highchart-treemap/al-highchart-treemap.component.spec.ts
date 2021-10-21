import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlHighchartTreeMapComponent } from './al-highchart-treemap.component';

xdescribe('AlHighchartTreeMapComponent', () => {
  let component: AlHighchartTreeMapComponent;
  let fixture: ComponentFixture<AlHighchartTreeMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AlHighchartTreeMapComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlHighchartTreeMapComponent);
    component = fixture.componentInstance;
    component.config = [
      {
        id: '1',
        name: 'High',
        color: '#EF534F'
      },
      {
        id: '2',
        name: 'Medium',
        color: '#FFB840'
      },
      {
        id: '3',
        name: 'Info',
        color: '#EDEDED'
      }
    ];
    fixture.detectChanges();

  });

  describe('When the component is initiated', () => {
    it('Should build the component', () => {
      component.ngOnInit();
      expect(component).toBeTruthy();
    });
  });
});
