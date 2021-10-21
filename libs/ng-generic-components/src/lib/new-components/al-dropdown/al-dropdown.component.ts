import { Component, Input, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
    selector: 'al2-dropdown',
    templateUrl: './al-dropdown.component.html',
    host: {
        '(document:click)': 'clickOut($event)'
    }
})
export class AlDropdownComponent implements OnInit {

    @ViewChild('customButtonContent', { read: ElementRef, static: true }) customButtonContent: ElementRef;

    @Input() id?: string;
    @Input() label?: string = '';
    @Input() buttonText?: string = 'Select Options';
    @Input() verticalSpace?: boolean = true;
    @Input() hint?: string;
    @Input() tip?: string;
    @Input() disabled?: boolean = false;
    @Input() error?: string;
    @Input() required?: boolean;

    customButton = false;
    optionsVisible = false;

    constructor(
        private eref: ElementRef
    ) { }

    @HostListener('document:click', ['$event'])
    clickOut(event: Event) {
        if (!this.eref.nativeElement.contains(event.target)) {
            this.close();
        }
    }

    ngOnInit() {
        this.customButton = !!this.customButtonContent?.nativeElement.innerHTML;
    }

    close() {
        this.optionsVisible = false;
    }

}
