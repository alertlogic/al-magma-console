import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';

/**
 * This commponent emits the onSearchChanged event, used to acknowledge
 * the search event in varying components.
 */
@Component({
    selector: 'al-search-bar',
    templateUrl: './al-search-bar.component.html',
    styleUrls: ['./al-search-bar.component.scss']
})
export class AlSearchBarComponent implements OnInit {

    @Input() placeholder: string = 'Search';
    @Input() width: string = "350px";
    @Input() showLabel: boolean = false;
    @Input() autofocus: boolean = false;
    @Input() maxSearchLength: number = 0;
    @Input() searchIcon:string = "toolbar";
    @Input() searchPatternRegex: string | null = null;
    @Input() invalidSearchPatternText: string | null = null;
    @Input() inputId:string = 'al-search-input';

    @Output() onSearchChanged: EventEmitter<string> = new EventEmitter();
    @Output() onFocusOut: EventEmitter<FocusEvent> = new EventEmitter();
    @Output() onInvalidSearchPattern: EventEmitter<void> = new EventEmitter();

    @ViewChild("searchBar", { static: true }) searchBarEleRef: ElementRef;

    public searchControl = new FormControl();
    public invalidPattern = false;
    private lastEmittedValue:string | null = null;

    private delayDebounce: number = 1000;

    ngOnInit() {
        const validators: ValidatorFn[] = [];
        if (this.maxSearchLength) {
             validators.push(Validators.maxLength(this.maxSearchLength));
        }
        if(this.searchPatternRegex) {
            validators.push(Validators.pattern(this.searchPatternRegex));
            if(!this.invalidSearchPatternText) {
                this.invalidSearchPatternText = 'Invalid Search Pattern Detected';
            }
        }
        this.searchControl = new FormControl('', validators);
    }

    /**
      * Emit the search information
      */
    ngAfterViewInit() {
        this.searchControl.valueChanges.pipe(
            debounceTime(this.delayDebounce),
            distinctUntilChanged())
            .subscribe(() => {
                if (this.searchControl.valid) {
                    this.invalidPattern = false;
                    if (!this.lastEmittedValue || this.lastEmittedValue !== this.searchControl.value){
                        this.onSearchChanged.emit(this.searchControl.value);
                        this.lastEmittedValue = this.searchControl.value;
                    }
                } else {
                    if(this.searchControl.errors && this.searchControl.errors.hasOwnProperty('pattern')) {
                        this.invalidPattern = true;
                        this.onInvalidSearchPattern.emit();
                    }
                }
            });
        if (this.autofocus) {
            this.searchBarEleRef.nativeElement.focus();
        }
    }

    public clear() {
        this.searchControl.setValue( "" );
    }

    onFocusOutEvent(event: FocusEvent) {
        this.onFocusOut.emit(event);
    }

    /**
     * Function to execute the search manually
     */
    public executeSearch(){
        if (this.searchControl.valid){
            this.invalidPattern = false;
            this.onSearchChanged.emit(this.searchControl.value);
            this.lastEmittedValue = this.searchControl.value;
            this.setFocus();
        }
    }

    /**
     * Function to set the focus on the search input
     */
    public setFocus(){
        this.searchBarEleRef.nativeElement.focus();
    }

    /**
     *
     * @param search string to search
     * @param executeSearch whether the search should be executed after the input receive the new value.
     */
    public setSearchValue(search:string, executeSearch:boolean = true){
        if (!executeSearch){
            this.lastEmittedValue = search;
        }
        this.searchControl.setValue(search);
    }

}
