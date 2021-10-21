import { Component, OnInit, ViewChild, SimpleChanges } from '@angular/core';
import { AppResourcesService } from '../../service/app-resources.service';
import { AlNavigationService } from '@al/ng-navigation-components';
import { AlViewHelperComponent } from '@al/ng-generic-components';

import { DongleAPIClient } from './dongle.api-client';

@Component({
  selector: 'app-validation-demo',
  templateUrl: './validation-demo.component.html',
  styleUrls: ['./validation-demo.component.scss']
})
export class ValidationDemoComponent implements OnInit
{
    public dongleClient = new DongleAPIClient();

    public loadedData:any;
    public resourceId:string = '1';

    @ViewChild('viewHelper', { static: true } )
    public viewHelper:AlViewHelperComponent;

    constructor( public navigation:AlNavigationService ) {
    }

    ngOnInit() {
        this.loadView();
    }

    public async loadView() {
        if ( this.resourceId === '' ) {
            this.loadedData = null;
            this.viewHelper.clearError();
            return;
        }
        try {
            this.loadedData = null;
            let resultData:any;
            if ( this.resourceId.includes("list") ) {
                resultData = await this.dongleClient.getDongles( this.resourceId );
            } else {
                resultData = await this.dongleClient.getDongle( this.resourceId );
            }
            this.loadedData = resultData;
            this.viewHelper.clearError();
        } catch( e ) {
            console.log("Raw error...", e );
            this.loadedData = null;
            this.viewHelper.setError( e );
        }
    }
}
