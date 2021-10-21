import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlDetailedTableListComponent } from './al-detailed-table-list.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TableListConfig } from '../types';

describe('AlDetailedTableListComponent', () => {
  let component: AlDetailedTableListComponent;
  let fixture: ComponentFixture<AlDetailedTableListComponent>;
  const mockConfig: TableListConfig = {
    headers: [],
    body: []
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlDetailedTableListComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlDetailedTableListComponent);
    component = fixture.componentInstance;
    component.config = mockConfig;
    fixture.detectChanges();

  });

  describe('When the component is initiated', () => {
    it('Should build the component', () => {
        component.ngOnInit();
        expect(component).toBeTruthy();
    });
  });
});
