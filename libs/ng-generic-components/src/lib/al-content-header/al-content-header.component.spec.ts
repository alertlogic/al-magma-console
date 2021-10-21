import { CalendarModule, Calendar } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlContentHeaderComponent } from './al-content-header.component';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AlContentHeaderComponent', () => {
    let component: AlContentHeaderComponent;
    let fixture: ComponentFixture<AlContentHeaderComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AlContentHeaderComponent],
            imports: [FormsModule, CalendarModule, CheckboxModule],
            schemas: [ NO_ERRORS_SCHEMA ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlContentHeaderComponent);
        component = fixture.componentInstance;
        component.icon = "fa bug";
        component.title = "title";
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the icon value', () => {
        expect(component.icon).toBe('fa bug');
    });

    it('should set title value ', () => {
        expect(component.title).toBe('title');
    });

    it('Call the toggleSelectorVisibility toggle the icon value of datePicker ', () => {
        component.showDateSelector = true;
        component.toggleSelectorVisibility();
        expect(component.showDateSelector).toBeFalsy();
    });

    it('Call the selectedDateRange will emit the selected date ', () => {
        let today = new Date();
        let lastSevendays = new Date();
        lastSevendays.setDate(today.getDate() - 7);
        component.dateRange = [lastSevendays, today];
        const fixture = TestBed.createComponent(Calendar);
        component.datePicker = fixture.componentInstance;
        component.onDateRangeSelected.subscribe((date: Date[])=>{
            expect(component.dateRange).toEqual(date);
        });
        component.selectedDateRange();
        expect(component.datePicker.overlayVisible).toBeFalsy();
    });

    it('Call the selectedSingleDate will emit the selected date ', () => {
        let today = new Date();
        component.dateRange = [today];
        const fixture = TestBed.createComponent(Calendar);
        component.datePicker = fixture.componentInstance;
        component.showCalendar = 'single';
        component.onDateRangeSelected.subscribe((date: Date[])=>{
            expect(component.dateRange).toEqual(date);
        });
        component.selectedSingleDate();
    });
    it('Call the close method to close datePicker', () => {
        const fixture = TestBed.createComponent(Calendar);
        component.datePicker = fixture.componentInstance;
        component.datePicker.overlayVisible = true;
        component.close();
        expect(component.datePicker.overlayVisible).toBeFalsy();
    });
});
