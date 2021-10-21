import { Component, Input, EventEmitter, Output, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';

@Component({
    selector: 'al-time-selector',
    templateUrl: './al-time-selector.component.html',
    styleUrls: ['./al-time-selector.component.scss']
})

export class AlTimeSelectorComponent implements AfterViewInit {
    /**
     * Inputs, properties to handle visual behaviour
     */
    @Input()
    get time(): Date { return this.myTime; }
    set time(time: Date) {
        this.myTime = time;
        this.timeParts = {hours: this.myTime.getHours(), minutes: this.myTime.getMinutes(), seconds: this.myTime.getSeconds()};
    }
    @Input() showSeconds: boolean = true;

    /**
     * Outputs
     */
    @Output() onTimeSelected: EventEmitter<Date> = new EventEmitter();

    /**
     * Public variables
     */
    public timeParts!: {hours: number, minutes: number, seconds: number};
    private myTime: Date = new Date();

    constructor( public element:ElementRef, public renderer:Renderer2 ) {
    }

    ngAfterViewInit() {
        try {
            let elements = this.element.nativeElement.querySelectorAll( "button.ui-button-secondary" );
            elements.forEach( ( el:any ) => this.renderer.setAttribute( el, 'tabindex', "-1" ) );
        } catch( e ) {
        }
    }

    /**
     * Handle date selection from calendar
     * @param date string, date string representation
     */
    timeChange(): void {
        setTimeout(() => {
            const selectedTime: Date = new Date(this.myTime.setHours(this.timeParts.hours, this.timeParts.minutes, this.timeParts.seconds));
            this.myTime = selectedTime;
            this.onTimeSelected.emit(selectedTime);
        });
    }
}
