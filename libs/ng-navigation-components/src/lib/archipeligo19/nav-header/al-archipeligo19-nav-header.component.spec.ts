import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlArchipeligo19NavHeaderComponent } from './al-archipeligo19-nav-header.component';

describe('AlArchipeligo19NavHeaderComponent', () => {
  let component: AlArchipeligo19NavHeaderComponent;
  let fixture: ComponentFixture<AlArchipeligo19NavHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlArchipeligo19NavHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlArchipeligo19NavHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
