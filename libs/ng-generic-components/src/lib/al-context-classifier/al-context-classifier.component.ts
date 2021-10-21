import {
    Component, Input, OnChanges, OnDestroy, SimpleChanges
} from '@angular/core';

@Component({
  selector: 'al-context-classifier',
  template: ''
})
export class AlContextClassifierComponent implements OnChanges, OnDestroy
{
    @Input() selector?:string;
    @Input() class?:string;
    @Input() all:boolean = false;

    protected appliedSelector?:string;
    protected appliedClass?:string;

    constructor() {
    }

    ngOnChanges( changes:SimpleChanges ){
        if ( `selector` in changes || `class` in changes ) {
            this.applyClassification();
        }
    }

    ngOnDestroy() {
        this.applyClassification( true );
    }

    applyClassification( destroy:boolean = false ) {
        if ( this.appliedSelector && this.appliedClass ) {
            if ( this.all ) {
                document.querySelectorAll( this.appliedSelector )
                        .forEach( element => element.classList.remove( this.appliedClass as string ) );
            } else {
                let element = document.querySelector( this.appliedSelector );
                if ( element ) {
                    element.classList.remove( this.appliedClass );
                }
            }
        }
        if ( ! destroy && this.selector && this.class ) {
            if ( this.all ) {
                document.querySelectorAll( this.selector )
                        .forEach( element => element.classList.add( this.class as string ) );
            } else {
                let element = document.querySelector( this.selector );
                if ( element ) {
                    element.classList.add( this.class );
                }
            }
            this.appliedSelector = this.selector;
            this.appliedClass = this.class;
        }
    }
}
