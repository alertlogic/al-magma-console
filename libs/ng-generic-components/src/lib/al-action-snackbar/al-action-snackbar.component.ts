import {
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import {
    AlActionSnackbarEvent, AlActionSnackbarElement,
} from '../types';

@Component({
    selector: 'al-action-snackbar',
    templateUrl: './al-action-snackbar.component.html',
    styleUrls: ['./al-action-snackbar.component.scss']
})
export class AlActionSnackbarComponent {

    @Input() text: string;
    @Input() visible: boolean = false;
    @Input() elements: AlActionSnackbarElement[];
    @Output() onElementPressed: EventEmitter<AlActionSnackbarEvent> = new EventEmitter<AlActionSnackbarEvent>();

    public actionSelected(event: AlActionSnackbarEvent): void {
        this.onElementPressed.emit(event);
    }

}
