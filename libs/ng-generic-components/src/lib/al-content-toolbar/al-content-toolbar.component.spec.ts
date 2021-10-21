import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AlSearchBarComponent } from '../al-search-bar/al-search-bar.component';
import { AlContentToolbarComponent } from './al-content-toolbar.component';
import { AlToolbarContentConfig } from '../types/al-generic.types';

describe('AlContentToolbarComponent', () => {
    let component: AlContentToolbarComponent;
    let fixture: ComponentFixture<AlContentToolbarComponent>;
    let config: AlToolbarContentConfig = {
        showSelectAll: false,
        showGroupBy: false,
        showSortBy: true,
        sort: {
            order: 'asc',
            options: [
                {
                    label: 'option1',
                    value: 'option_1'
                },
                {
                    label: 'option2',
                    value: 'option_2'
                }]
        },
        search: {
            maxSearchLength: 20,
            textPlaceHolder: "search"
        },
        group: {
            options: [
                {
                    label: 'group1',
                    value: 'group_1'
                },
                {
                    label: 'group2',
                    value: 'group_2'
                }]
        }
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AlContentToolbarComponent, AlSearchBarComponent],
            imports: [DropdownModule, FormsModule, ReactiveFormsModule, CheckboxModule, TooltipModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlContentToolbarComponent);
        component = fixture.componentInstance;
        component.config = config;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('call the sort method to emit order with default value asc ', () => {
        component.state.sort.order = '';
        component.onOrderBy.subscribe((order: string) => {
            expect(order).toEqual('asc');
        });
        component.sort();
    });
    it('sort details by order with selected value', () => {
        component.onOrderBy.subscribe((order: string) => {
            expect(component.state.sort.order).toEqual(order);
        });
        component.sort();
    });

    it('Call handleSortSelection method to emit dropdown selected value to sort the data', () => {
        component.state.sort.selectedOption = 'option_1';
        component.onSortSelection.subscribe((selectedValue: string) => {
            expect(component.state.sort.selectedOption).toEqual(selectedValue);
        });
        component.handleSortSelection();
    });

    it('Call the handleGroupSelection method to emit the selected value to group the data', () => {
        component.state.showGroupBy = true;
        component.state.group.selectedOption = 'group_1';
        component.onGroupSelection.subscribe((selectedValue: string) => {
            expect(component.state.group.selectedOption).toEqual(selectedValue);
        });
        component.handleGroupSelection();
    });

    it('Emit the  selectAll value on click of checkbox', () => {
        component.state.showSelectAll = true;
        component.state.selectAll = true;
        component.onSelectAll.subscribe((value: boolean) => {
            expect(component.state.selectAll).toEqual(value);
        });
        component.selectAllValues();
    });

    it('Apply text filter on search string', () => {
        const searchText = 'shell';
        component.onSearched.subscribe((searchValue: string) => {
            expect(searchText).toEqual(searchValue);
        });
        component.applyTextFilter(searchText);
    });
});
