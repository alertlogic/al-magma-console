import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { AlViewHelperComponent } from '@al/ng-generic-components';
import { AlDefaultClient } from '@al/core';
import { AlSimpleFilter, AlSimpleFilterValue } from '@al/ng-generic-components';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

	public loadedFilters:AlSimpleFilter[];

    @ViewChild("viewHelper", { static: true } )
    public viewHelper:AlViewHelperComponent;

	constructor() {
	}

	ngOnInit() {
		this.populateView();
	}

	async populateView() {
        this.viewHelper.startLoading();
		try {
			let url = '/assets/demo/data/filters-incidents.json';
			let filterContainer = await AlDefaultClient.get( { url } );
			if ( ! ( 'filters' in filterContainer ) ) {
				throw new Error(`The data file '${url}' does not contain a filter definition` );
			}
			this.loadedFilters = filterContainer.filters as AlSimpleFilter[];
			console.log("Loaded filters", this.loadedFilters );
		} catch( e ) {
            this.viewHelper.setError( e );
        } finally {
            this.viewHelper.stopLoading();
        }
	}

    /**
     * This event will be fired when a new value is added to the filter, and references that value.
     */
    onAddFilter( value:AlSimpleFilterValue ) {
        console.log("Added filter!", value );
    }

    /**
     * This event will be fired when a value is removed from the filter, and references that value.
     */
    onRemoveFilter( value:AlSimpleFilterValue ) {
        console.log("Removed filter!", value );
    }

    /**
     * This event will be fired when any change occurs to the filter selection, and emits the complete array of applied filters
     */
    onFiltersChanged( selection:AlSimpleFilterValue[] ) {
        console.log("Filters changed: %s applied", selection.length );
    }
}
