import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

@Component({
    selector: 'al-time-input-deprecated',
    templateUrl: './al-time-input-deprecated.component.html',
    styleUrls: ['./al-time-input-deprecated.component.scss']
})
export class AlTimeInputDeprecatedComponent implements OnInit {

    private hoursValue: string = "";
    private minutesValue: string = "";

    @Output() hoursChange: EventEmitter<any> = new EventEmitter();
    @Output() minutesChange: EventEmitter<any> = new EventEmitter();
    @Output() onChanges: EventEmitter<any> = new EventEmitter();

    @Input()
    set hours(value: string) {
        this.hoursValue = value ? value.trim() : value;
        this.hoursChange.emit(this.hoursValue);
    }
    get hours() {
        return this.hoursValue;
    }

    @Input()
    set minutes(value: string) {
        this.minutesValue = value ? value.trim() : value;
        this.minutesChange.emit(this.minutesValue);
    }
    get minutes() {
        return this.minutesValue;
    }

    constructor() { }

    ngOnInit() {}

    detectChanges() {
        this.onChanges.emit();
    }

}
