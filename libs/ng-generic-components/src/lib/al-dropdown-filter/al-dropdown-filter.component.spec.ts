import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DropdownModule } from 'primeng/dropdown';
import { AlSelectFilterItemDetails } from './al-dropdown-filter.types';

import { AlDropdownFilterComponent } from './al-dropdown-filter.component';
import { FormsModule } from '@angular/forms';

describe('AlDashboardFilterComponent', () => {
  let component: AlDropdownFilterComponent;
  let fixture: ComponentFixture<AlDropdownFilterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DropdownModule, FormsModule],
      declarations: [ AlDropdownFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlDropdownFilterComponent);
    component = fixture.componentInstance;
    component.defaultWidth = '350px';
    fixture.detectChanges();
  });

  describe('When the component is initiated', () => {
    it('Should build', () => {
        component.ngOnInit();
        expect(component.defaultWidth).toBe('350px');
    });
  });

  describe('When a dashboard is toggled', () => {
    it('Should emit the selected item', () => {
        const item: AlSelectFilterItemDetails = {id: 1, name: 'a', code: 1};
        jest.spyOn(component.onFilterSelection, 'emit');
        component.clickEvent(item);
        expect(component.onFilterSelection.emit).toHaveBeenCalledWith(item);
    });
  });

});
