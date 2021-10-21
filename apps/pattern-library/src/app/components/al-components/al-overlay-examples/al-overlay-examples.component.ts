import { Component } from '@angular/core';
import { AlActionSnackbarElement, AlActionSnackbarEvent } from '@al/ng-generic-components';

@Component({
    templateUrl: './al-overlay-examples.component.html',
    styleUrls: ['./al-overlay-examples.component.scss']
})
export class AlOverlayExamplesComponent {

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
            visible: false,
            type: 'button'
        },
        {
            event: "toggle",
            checked: true,
            text: "TOGGLE ME",
            visible: false,
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
