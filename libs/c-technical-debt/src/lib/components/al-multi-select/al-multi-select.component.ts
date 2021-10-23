/**
 *  AlMultiSelectComponent provides the functionality of the getting data from multiple options listing by group

 How to use it?

    [config] ===> this input will recieve the following params wich are required:

        placeholder     --> Text will be shown as placeholder when there are not selected items
        items           --> All available items will be shown in the component's list
        selectedItems   --> Items which are previously selected, these can be an array's string IDs or an array's objects
        labelToBind     --> Text which be shown in the dropdown in each selectable item.
        valueToBind     --> Property which represents the ID of each item. If it is not specified, the output
                            data will be an array of item objects, otherwise a selected item IDs Array will be return.

    (onChangedData)     ==> This output will be fired when the data in the multi-select has changed
                            The receive data will be an array of IDs
                            -> Note that the attribute that you define as valueToBind, will be the each id value here

    (onEndedScroll)     ==> This output will be fired when the scroll gets the end

    <al-multi-select
        [config]="multiSelectConfig"
        (onChangedData)="handleSelectFilter($event)"
        (onEndedScroll)="handleEndScroll()">
    </al-multi-select>

    Following an example of variables that you can to use:

    public multiSelectConfig: object = {
        placeholder: "Select Filters",
        items: [
            { id: '1', value: 'Adam', country: 'United States'},
            { id: '2', value: 'Samantha', country: 'United States',},
            { id: '3', value: 'Amalie', country: 'Argentina'},
            { id: '4', value: 'Estefanía', country: 'Argentina'},
            { id: '5', value: 'Adrian', country: 'Ecuador'},
            { id: '6', value: 'Wladimir Zuajmaics Lockioz Pladkaqp', country: 'Ecuador'},
            { id: '7', value: 'Natasha', country: 'Ecuador'},
            { id: '8', value: 'Nicole', country: 'Colombia'},
            { id: '9', value: 'Michael', country: 'Colombia'},
            { id: '0', value: 'Nicolás', country: 'Colombia' }
        ],
        selectedItems: ['0'],
        labelToBind: "value",
        valueToBind: "id",
        groupBy: "country"
    };

    handleSelectFilter(data: Array<any>) {
        console.log("Getting from multi-select -> ", data);
    }

    handleEndScroll() {
        console.log("Handling end of the scroll...");
    }

    Further info: https://github.com/ng-select/ng-select

 *  @author Carlos Orozco <carlos.orozco@alertlogic.com>
 *
 *  @copyright Alert Logic, Inc 2018
 */

import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
    selector: 'al-multi-select',
    templateUrl: './al-multi-select.component.html',
    styleUrls: ['./al-multi-select.component.scss']
})
export class AlMultiSelectComponent implements OnInit, AfterViewInit {

    @ViewChild('alMultiSelect', { static: true }) myNgSelectComponent: NgSelectComponent;
    /**
     * Inputs
     */
    @Input() config: object = {
        placeholder: "Select an option",
        items: [],
        selectedItems: [],
        labelToBind: "",
        valueToBind: "",
        groupBy: ""
    };
    @Input() disabled: boolean = false;
    @Input() multiple: boolean = true;
    @Input() clearable: boolean = true;

    /**
     * Outputs
     */
    @Output() onChangedData: EventEmitter<any> = new EventEmitter();
    @Output() onEndedScroll: EventEmitter<any> = new EventEmitter();

    public selectedItems: any;

    ngAfterViewInit() {
        // this has to be set programmatically because the [virtualScroll] attribute is provided by more than one component
        this.myNgSelectComponent.virtualScroll = true;
    }
    constructor() { }

    ngOnInit() {
    }

    handleOutputData(data: Array<object>) {
        if (Array.isArray(data)) {
            let filteredItems: Array<object> = [];
            data.forEach(item => {
                filteredItems.push(
                    item[this.config['valueToBind']]
                );
            });
            this.onChangedData.emit(
                this.config['valueToBind'] ? filteredItems : data
            );
        } else {
            this.onChangedData.emit(data);
        }
    }

    handleEndScroll() {
        this.onEndedScroll.emit();
    }

}
