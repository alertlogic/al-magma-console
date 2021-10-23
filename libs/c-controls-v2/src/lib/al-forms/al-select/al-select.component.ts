import { AlOptionItem } from '../../types/al-common.types';
import { Component, Input, Output, EventEmitter, OnInit, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'ald-select',
    templateUrl: './al-select.component.html',
	styleUrls: ['./al-select.component.scss'],
    // tslint:disable-next-line:no-host-metadata-property
    host: {
        '(document:click)': 'clickOut($event)'
    },
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AlSelectComponent),
        multi: true
    }]
})
export class AlSelectComponent implements OnInit, ControlValueAccessor {

    @Input() id?: string;
    @Input() label: string = '';
    @Input() verticalSpace?: boolean = true;
    @Input() name: string = this.label;
    @Input() disabled?: boolean = false;
    @Input() required?: boolean = false;
    @Input() multiple?: boolean = false;
    @Input() size?: number = 0;
    @Input() hint?: string;
    @Input() tip?: string;
    @Input() error?: string;
    @Input() defaultOptions?: boolean | AlOptionItem[];
    @Input() options: AlOptionItem[] = [];
    @Input() value: string = '';
    @Output() didChange: EventEmitter<string> = new EventEmitter<string>();

    searchText: string = '';
    optionsVisible: boolean = false;

    constructor(
        private eref: ElementRef
    ) { }

    ngOnInit(): void {

    }

    clickOut(event: Event) {
        if (!this.eref.nativeElement.contains(event.target)) {
            this.optionsVisible = false;
        }
    }

    onChange: (newValue: Object | string) => void = () => { };

    onTouched: () => void = () => { };
    onValueChange(newValue?: string) {
        if (newValue === undefined) {
            this.onChange(this.value);
        } else {
            this.onChange(newValue);
            this.value = newValue;
        }
        this.didChange.emit(this.value);
    }
    writeValue(value: any) {
        this.value = value;
    }
    registerOnChange(fn: any) { this.onChange = fn; }
    registerOnTouched(fn: any) { }

}
