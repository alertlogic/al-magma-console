import { Component, ViewEncapsulation } from '@angular/core';
import { AlActionSnackbarEvent, AlActionSnackbarElement} from '@al/ng-generic-components';

@Component({
    selector: 'overlays-snackbar-select-action',
    templateUrl: './overlays-snackbar-select-action.component.html',
    styleUrls: ['./overlays-snackbar-select-action.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class OverlaysSnackbarSelectActionComponent {

    public actionSnackbarButtons: AlActionSnackbarElement[] = [
		{
            event: "keep",
            icon: "check_circle",
            text: "KEEP",
            visible: true,
            type: 'button'
        },
        {
            event: "clear",
            icon: "cancel",
            text: "CLEAR ALL",
            visible: true,
            type: 'button'
        },
        {
            event: "toggle",
            text: "Toggle me",
            visible: true,
            type: 'input_switch'
        }
    ];
    public actionSnackbarVisible: boolean = false;
    public actionSnackbarText: string = 'Hello Word!';
    public actionSnackbarSelectedOption: AlActionSnackbarEvent = '';

    public actionSnackbarEvent(event: AlActionSnackbarEvent) {
        this.actionSnackbarSelectedOption = event;
    }
}
