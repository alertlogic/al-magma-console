/**
 * Build a group of elements dynamically from the definition of a JSON type object, the supported elements are:
 * - input,
 * - password,
 * - textarea,
 * - checkbox (one or more grouped items)
 *
 * @author Juan Kremer <jkremer@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AlFormElementBase, AlFormElementChange } from '../types';
import { AlSubscriptionGroup } from '@al/core';

@Component({
    selector: 'al-dynamic-form',
    templateUrl: './al-dynamic-form.component.html'
})
export class AlDynamicFormComponent<ModelType=any> implements OnInit, OnDestroy {
    @Input() elements: AlFormElementBase<string>[] = [];
    @Input() allowEmptyValues: boolean = false;

    /**
     * Emits true if the form's current state is valid, false otherwise
     */
    @Output() isValid           = new EventEmitter<boolean>();

    /**
     * Emits the current aggregate state of the form after each change.
     */
    @Output() onChanges         = new EventEmitter<ModelType>();

    /**
     * Emits a detailed change record for each change.
     */
    @Output() onFieldChange     = new EventEmitter<AlFormElementChange>();

    /** Grouping form elements */
    public form: FormGroup;

    private subscriptions       = new AlSubscriptionGroup();
    private lastValues:any      = {};
    private lastState?:boolean;

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.form = this.toFormGroup(this.elements);
        this.addListeners();
    }

    ngOnDestroy(): void {
        this.subscriptions.cancelAll();
    }

    /**
     * Give the result of the form
     *
     * @deprecated
     * @returns Object: key:value with the result of the form
     */
    public onSubmit() {
        const formValues:{[key:string]:unknown} = {};
        this.elements.forEach(element => {
            const value = element.getAnswer();
            if( element.type === 'hidden' ||
                typeof value === 'boolean' ||
                typeof value === 'number' ||
                element.dataType === 'object' ||
                (value && value.length > 0) ||
                this.allowEmptyValues ) {
                formValues[element.key] = value;
            }

        });

        return formValues;
    }

    public getFormValues():ModelType {
        return this.lastValues as ModelType;
    }

    public getFormValue<Type = any>( field:string ):Type|undefined {
        if ( field in this.lastValues ) {
            return this.lastValues[field];
        } else {
            return undefined;
        }
    }

    /**
     * Init and configure the elements and their validation in a FormControl
     *
     * @param elements Element to build
     *
     * @returns FormGroup: Grouping form elements
     */
    private toFormGroup(elements: AlFormElementBase<any>[]) {
        const group: any = {};

        elements.forEach(element => {
            group[element.key] = element.getFormControl();
            this.lastValues[element.key] = element.value;
        });

        return this.formBuilder.group(group);
    }

    /**
     * Indicate if the form is valid (if all the elements have been filled in and are valid
     * according to the validations assigned to each element) or if the form has not passed
     * the configured validations.
     *
     * The answers are emitted in each change in any element in the form.
     */
    private addListeners() {
        this.subscriptions.manage(
            this.form.valueChanges.subscribe( changes => this.onValueChange( changes ) ),
            this.form.statusChanges.subscribe( status => this.onStatusChange( status ) )
        );
    }

    private onValueChange( changes:any ) {
        Object.entries( this.lastValues )
            .forEach( ( [ field, previousValue ] ) => {
                if ( ! ( field in changes ) || changes[field] !== previousValue ) {
                    console.log("Field %s changed", field, changes[field], previousValue );
                    this.onFieldChange.emit( { field, previousValue, value: changes[field] } );
                }
            } );
        this.onChanges.emit(changes);
    }

    private onStatusChange( status:string ) {
        let validState = status === 'INVALID' ? false : true;
        if ( validState !== this.lastState ) {
            this.isValid.emit( validState );
            this.lastState = validState;
            console.log("New valid status: ", status );
        }
    }
}
