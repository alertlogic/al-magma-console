import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AlBottomSheetComponent } from './al-bottom-sheet.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AlBottomSheetHeaderOptions } from './al-bottom-sheet-header-options.types';

describe('AlBottomSheetComponent', () => {
    let component: AlBottomSheetComponent;
    let fixture: ComponentFixture<AlBottomSheetComponent>;
    let headerOptions: AlBottomSheetHeaderOptions = {
        icon: 'Test',
        title: 'Test',
        primaryAction: {
            text: 'Open',
            disabled: true,
        },
        secondaryAction: {
            text: 'Cancel',
            disabled: false
        },
        tertiaryAction: {
            text: 'Toggle',
            disabled: false
        }
    };
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule],
            declarations: [AlBottomSheetComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlBottomSheetComponent);
        component = fixture.componentInstance;
        component.headerOptions = headerOptions;
        fixture.detectChanges();
    });
  
    it('should be instantiated', () => {
        expect(component).toBeTruthy();
        expect(component.dismissible).toBeFalsy();
        expect(component.blockScroll).toBeTruthy();
        expect(component.showCloseIcon).toBeFalsy();
    });

    it('call `open()` method to open the bottom-sheet', () => {

        const enableModality = jest.spyOn(component, 'enableModality');
        component.mask = document.createElement('div');
        component.open();
        expect(component.state).toEqual('opened');
        expect(component.visible).toBeTruthy();
        expect(component.fullScreen).toBeTruthy();
        expect(enableModality).toHaveBeenCalled();
    });
    it('call `collapse()` method to collapse the bottom sheet', () => {

        const disableModality = jest.spyOn(component, 'disableModality');
        component.collapse();
        expect(component.state).toEqual('collapsed');
        expect(component.visible).toBeTruthy();
        expect(component.fullScreen).toBeFalsy();
        expect(disableModality).toHaveBeenCalled();
    });

    it('call `hide()` method to to close the bottom sheet', () => {

        const disableModality = jest.spyOn(component, 'disableModality');
        component.hide();
        expect(component.state).toEqual('closed');
        expect(component.visible).toBeFalsy();
        expect(component.fullScreen).toBeFalsy();
        expect(disableModality).toHaveBeenCalled();
    });

    xit('call `toggle()` method allow collapse and show the bottom-sheet', () => {

        component.visible = true;
        component.fullScreen = true;
        component.toggle();

        expect(component.state).toEqual('collapsed');
        expect(component.visible).toBeTruthy();
        expect(component.fullScreen).toBeFalsy();
        component.visible = false;
        component.fullScreen = false;
        component.toggle();
        expect(component.state).toEqual('opened');
        expect(component.visible).toBeTruthy();
        expect(component.fullScreen).toBeTruthy();
    });
});
