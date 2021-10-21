import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlTaskPaletteComponent } from './al-task-palette.component';
import { AlFilterTaskPalettePipe } from '../pipes/al-filter-task-palette.pipe';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AlTaskPaletteComponent', () => {
    let component: AlTaskPaletteComponent;
    let fixture: ComponentFixture<AlTaskPaletteComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [AlTaskPaletteComponent,AlFilterTaskPalettePipe]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlTaskPaletteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should match with the defaults', () => {
        expect(component.title).toEqual("");
        expect(component.listOptions.length).toEqual(0);
        expect(component.search).toEqual("");
    });

    it('should set search value', () => {
        component.onSearch("test");
        expect(component.search).toEqual("test");
    });

    it('When the item is selected should emit a value', () => {
        jest.spyOn(component.selected, 'emit');
        component.onSelect("test");
        expect(component.selected.emit).toHaveBeenCalledWith("test");
    });

    it('When the x icon is clicked should emit', () => {
        jest.spyOn(component.closePalette, 'emit');
        component.onClose();
        expect(component.closePalette.emit).toHaveBeenCalled();
    });
});
