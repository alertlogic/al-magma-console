import { AlCardstackView } from '@al/core';
import { NgGenericComponentsModule, AlUiFilterValue } from '@al/ng-generic-components';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { TabMenuModule } from 'primeng/tabmenu';
import {
    DummyCardstack,
    dummyColors,
} from './card-stack-fakes';
import { ContainsPipe } from '../pipes/contains-pipe.pipe';
import { FilterListByActiveFiltersPipe } from '../pipes/filter-list-by-active-filters-pipe';
import { AlCardstackComponent } from './al-cardstack.component';


xdescribe('AlCardstackComponent', () => {
    let component: AlCardstackComponent;
    let fixture: ComponentFixture<AlCardstackComponent>;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AlCardstackComponent, ContainsPipe, FilterListByActiveFiltersPipe],
            imports: [
                NgGenericComponentsModule,
                AccordionModule,
                DropdownModule,
                FormsModule,
                ReactiveFormsModule,
                CheckboxModule,
                CalendarModule,
                BrowserAnimationsModule,
                TabMenuModule,
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlCardstackComponent);
        component = fixture.componentInstance;
        component.view = new DummyCardstack();
        spyOn(component.view, 'start');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    it('Apply text filter on search string ', () => {
        const searchString = 'window'; // view should have remoteSearch true
        component.applyTextFilter(searchString);
        expect(component.view.textFilter).toEqual(new RegExp(searchString, 'i'));
        expect(component.view.start).toHaveBeenCalled();
    });

    it('Apply sort on basis of order', () => {
        let order: AlCardstackView["sortOrder"] = 'desc';
        const date = component.view.getProperty("date_created");
        component.view.sortingBy = date;
        component.sortByOrder(order);
        expect(component.view.sortOrder).toEqual(order);
        expect(component.view.start).toHaveBeenCalled();
        order = 'asc';
        component.sortByOrder(order);
        expect(component.view.sortOrder).toEqual(order);
        expect(component.view.start).toHaveBeenCalled();
    });

    it('Apply the dateRange filter on selected date ', () => {
        const today = new Date();
        const lastthirtydays = new Date();
        lastthirtydays.setDate(today.getDate() - 30);
        const dateRange = [lastthirtydays, today];
        component.dateRangeSelected(dateRange);
        expect(component.view.dateRange).toEqual(dateRange);
        expect(component.view.start).toHaveBeenCalled();
    });

    it('Apply sort on basis of selected dropdown value', () => {
        const sortBy = "date_created";
        component.view.sortOrder = 'asc';
        const dateCreated = component.view.getProperty(sortBy);
        component.sortByChanged(sortBy);
        expect(component.view.sortingBy).toEqual(dateCreated);
        expect(component.view.start).toHaveBeenCalled();
    });

    // FIXME:  Cannot read property 'nativeElement' of undefined
    it('call `clearAllFilters()` method', () => {
        component.clearAllFilters();
        expect(component.view.start).toHaveBeenCalled();
    });

    it('call `onScroll()` method', () => {
        spyOn(component.view, 'continue');
        window.scrollTo(500, 500);
        // expect(component.view.continue).toHaveBeenCalled();
    });

    it('call `setActiveFilter()` method', () => {
        expect(Object.keys(component.view.activeFilters).length).toEqual(0);
        component.setActiveFilter(dummyColors[0] as AlUiFilterValue, 'color');
        expect(Object.keys(component.view.activeFilters).length).toEqual(1);
        expect(component.view.start).toHaveBeenCalled();
    });
});
