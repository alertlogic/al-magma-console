import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlArchipeligo19SidenavComponent } from './al-archipeligo19-sidenav.component';

describe('AlArchipeligo19SidenavComponent', () => {
  let component: AlArchipeligo19SidenavComponent;
  let fixture: ComponentFixture<AlArchipeligo19SidenavComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlArchipeligo19SidenavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlArchipeligo19SidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
