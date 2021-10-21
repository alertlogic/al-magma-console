import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { AlBottomSheetHeaderOptions, AlBottomSheetComponent } from '@al/ng-generic-components';

@Component({
    selector: 'overlays-bottom-sheets',
    templateUrl: './overlays-bottom-sheets.component.html',
    styleUrls: ['./overlays-bottom-sheets.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class OverlaysBottomSheetsComponent {


    @ViewChild(AlBottomSheetComponent, {static:false}) alBottomSheet: AlBottomSheetComponent;

    headerOptions: AlBottomSheetHeaderOptions = {
        icon: 'call_merge',
        title: 'My Title',
        collapsibleFromTitle: true,
        primaryAction: {
            text: 'Save',
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

    public save() {
        console.log('onSave');
    }

    public cancel() {
        console.log('onCancel');
        this.alBottomSheet.hide();
    }

    public open() {
        console.log('onOpen');
        this.alBottomSheet.open();
    }

    public toggle() {
        this.alBottomSheet.toggle();
    }
}
