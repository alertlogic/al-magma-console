/**
 *  AlSelectorComponent provides all functionality for selecting options.
 *
 *  @author Carlos Orozco <carlos.orozco@alertlogic.com>
 *
 *  @copyright Alert Logic, Inc 2018
 *

    How to use al-order-selector?

    <al-order-selector
        (onChecked)="selectAllIncidents($event)"
        (onSelected)="classifyIncidents($event)"
        (onSorted)="orderIncidents($event)"
        [config]="selectorIncidentsConfig">
    </al-order-selector>

    public selectorIncidentsConfig: object = {
    isChecked: true,                                    --> Indicates if the checkbox is checked or not.
    placeholder: 'Choose an option',                    --> Text for showing as a placeholder in the selector.
    selectedOption: 'byDate',                           --> Option selected from the selector.
    order: 'asc',                                       --> Indicates the order: 'asc' for ascending mode, and 'desc' for descending mode.
    options: [
            {
                value: 'byDate',                        --> Indicates the ID for the selected option.
                name: 'Organize by Date'                --> This text will be shown by each option into the selector.
            },
            {
                value: 'byThreat',
                name: 'Organize by Threat'
            },
            {
                value: 'byClassification',
                name: 'Organize by Classification'
            },
            {
                value: 'byCategory',
                name: 'Organize by Category'
            },
            {
                value: 'byDeployment',
                name: 'Organize by Deployment'
            },
            {
                value: 'byAccount',
                name: 'Organize by Account'
            }
        ]
    };

    selectAllIncidents(allIncidentsSelected: boolean) {
        // This function will be launch when checked or unchecked the mat-checkbox
        console.log("Have been selected all Incidents?: ", allIncidentsSelected);
    }

    classifyIncidents(classifyBy: string) {
        // This function will be launch when an option is selected from the selector
        console.log("Classifying Incidents by: ", classifyBy);
    }

    orderIncidents(orderIncidentsBy: string) {
        // This function will be launch when this is clicked, returning 'asc' or 'desc'
        console.log("Ordering Incidents by: ", orderIncidentsBy);
    }

 */


import { debounceTime } from 'rxjs/operators';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

export interface AlSelectorDeprecated {
    hide?: boolean;
    options: Array<{name:string;value:string;}>;
    placeholder: string;
    selectedOption: string;
}

export interface AlSelectorConfig {
    maxSearchLength?: ''|number;
    options: Array<{name:string;value:string;}>;
    hideSelector?: boolean;
    currentSearch?: string;
    placeholder: string;
    textPlaceHolder?: string;
    isChecked: boolean;
    selectedOption: string;
    order: string;
    groupSelect?: AlSelectorDeprecated; // another select
    border?: boolean; // if you want show a border bottom
}

@Component({
    selector: 'al-order-selector',
    templateUrl: './al-order-selector.component.html',
    styleUrls: ['./al-order-selector.component.scss']
})
export class AlOrderSelectorComponent implements OnInit, AfterViewInit {

    /**
     * Inputs
     */
    @Input() config: AlSelectorConfig = {
        isChecked: false,
        placeholder: '',
        selectedOption: '',
        options: [],
        order: 'asc',
        maxSearchLength: '',
        textPlaceHolder: "search",
        currentSearch: "",
        hideSelector: false,
        border: false
    };
    @Input() advancedSearchEnabled:boolean = false;
    @Input() simpleMode:boolean = false;
    @Input() showAdvancedSearchButton:boolean = true;

    /**
     * Outputs
     */
    @Output() onChecked: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onSelected: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSorted: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSearched:EventEmitter<string> = new EventEmitter<string>();
    @Output() onActivateAdvSearch:EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onChangeGrouping: EventEmitter<MatSelectChange> = new EventEmitter<MatSelectChange>();

    private delayDebounce:number = 500;
    public showAdvancedSearch:boolean = false;
    public searchControl = this.config.maxSearchLength === '' ? new FormControl() : new FormControl(Validators.maxLength(this.config.maxSearchLength));
    public searchPlaceHolder:string = this.config.textPlaceHolder;

    constructor() {
        // this.brainstem.hook("AlListHeader.clearSearch", this.clearSearch);       // chore(kjn): determine if this is necessary...
    }

    ngOnInit() {
        if( this.config.currentSearch ){
            this.searchControl.setValue(this.config.currentSearch);
        }
    }

    selectAll() {
        this.onChecked.emit(this.config.isChecked);
    }

    handleSelection() {
        this.onSelected.emit(this.config.selectedOption);
    }

    sort() {
        this.config.order = this.config.order === 'asc' ? 'desc' : 'asc';
        this.onSorted.emit(this.config.order);
    }

    /**
     * Emit the event search
     */
    ngAfterViewInit(){
        this.searchControl.valueChanges.pipe(
            debounceTime(this.delayDebounce))// delay search
            .subscribe( () => {
                if(this.searchControl.valid){
                    this.onSearched.emit( this.searchControl.value );
                }
        });
    }

    clearSearch = () => {
        this.searchControl.setValue("");
    }

    public toggleAdvancedSearch(show:boolean){
        this.showAdvancedSearchButton = !show;
        this.showAdvancedSearch = show;
        this.onActivateAdvSearch.emit(this.showAdvancedSearch);
    }

    changeGruoupingSelection(event: MatSelectChange){
        this.onChangeGrouping.emit(event);
    }

}
