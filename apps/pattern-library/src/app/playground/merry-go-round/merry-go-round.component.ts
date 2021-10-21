import { Component, OnInit } from '@angular/core';
import { AppResourcesService } from '../../service/app-resources.service';
import { AlNavigationService } from '@al/ng-navigation-components';

interface BadQuotation {
    text: string;
    attribution: string;
}

@Component({
  selector: 'app-merry-go-round',
  templateUrl: './merry-go-round.component.html',
  styleUrls: ['./merry-go-round.component.scss']
})
export class MerryGoRoundComponent implements OnInit
{
    public selectedQuotation:BadQuotation;
    constructor( public navigation:AlNavigationService,
                 public resources:AppResourcesService ) {
    }

    ngOnInit() {
        //  Always called at initialization time
        this.selectQuotation();
    }

    async selectQuotation() {
        try {
            let data = await this.resources.getResourceObject( "data/playground/merry-go-round/fake-quotes" );
            if ( ! data.hasOwnProperty( "quotations" ) || ! Array.isArray( data.quotations ) ) {
                throw new Error("Unexpected resource structure!" );
            }
            let quotations = data.quotations as BadQuotation[];
            this.selectedQuotation = quotations[ Math.floor( Math.random() * quotations.length ) ];
        } catch( e ) {
            console.warn("Failed to initialize: ", e );
        }
    }
}
