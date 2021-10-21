import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AlStateFilterComponent } from './al-state-filter.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { AlStateFilterDescriptor } from './al-state-filter-descriptor.type';
import { AlPrefixMultiplierPipe } from '../pipes';

describe('AlStateFilterComponent', () => {
    let component: AlStateFilterComponent;
    let fixture: ComponentFixture<AlStateFilterComponent>;
    let stateFilters:{value :AlStateFilterDescriptor}[]=[
        { value:{ label:'Active', iconClass: 'fa active', icon: 'check_circle', showTotal: true,totalShowing:12, total:15 }},
        { value:{ label:'Inactive', iconClass: 'fa inactive', icon: 'block', showTotal: false }},
        { value:{ label:'Delete', iconClass: 'fa delete', icon: 'delete', showTotal: false }}
    ];
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ NoopAnimationsModule, FormsModule, ListboxModule ],
            declarations: [ AlStateFilterComponent,AlPrefixMultiplierPipe ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlStateFilterComponent);
        component = fixture.componentInstance;
        component.stateFilters = stateFilters;
        component.selectedState = stateFilters[0].value;
        fixture.detectChanges();
    });

    it('should be instantiated', () => {
        expect(component).toBeTruthy();
    });

    it('call `selectState()` method to emit the selected state', () => {
        const filterSelected : {originalEvent:Event, value: AlStateFilterDescriptor}={
            originalEvent : new MouseEvent('click') , value :stateFilters[1].value
        };
        component.filterSelected.subscribe((selectFilter:{originalEvent:Event, value: AlStateFilterDescriptor})=>{
            expect(filterSelected.originalEvent).toEqual(selectFilter.originalEvent);
            expect(stateFilters[1].value.label).toEqual(selectFilter.value.label);
            expect(stateFilters[1].value.icon).toEqual(selectFilter.value.icon);
            expect(stateFilters[1].value.showTotal).toEqual(selectFilter.value.showTotal);
        });
        component.selectState(filterSelected);
    });

});
