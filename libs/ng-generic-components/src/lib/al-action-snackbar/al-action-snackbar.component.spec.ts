
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AlActionSnackbarEvent } from '../types';
import { AlActionSnackbarComponent } from './al-action-snackbar.component';

import {InputSwitchModule} from 'primeng/inputswitch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('AlActionSnackbarComponent', () => {
  let component: AlActionSnackbarComponent;
  let fixture: ComponentFixture<AlActionSnackbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [InputSwitchModule, FormsModule, ReactiveFormsModule],
      declarations: [ AlActionSnackbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlActionSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('call `actionSelected` method and emit the selected value', () => {
      const key :string = 'keep';
      component.onElementPressed.subscribe((event:AlActionSnackbarEvent)=>{
        expect(key).toEqual(event);
      });
      component.actionSelected(key);
  });

});
