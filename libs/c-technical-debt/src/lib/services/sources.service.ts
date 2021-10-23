
import {map, pluck} from 'rxjs/operators';
/**
 * SourcesService
 *
 * @author Julian David <jgalvis@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2018
 */
import { Injectable } from '@angular/core';
import { BaseAPIClient } from './base.apiclient';
import { AlLocation } from '@al/core';
import { SourceSnapshot, SourceDescriptor, CredentialsHostScanSnapshot } from '../types';
import { Observable } from 'rxjs';

@Injectable()
export class SourcesService extends BaseAPIClient {

    public source: SourceSnapshot;
    static resource: string = "sources";

    constructor() {
        /*  See APIClientBaseService. */
        super(AlLocation.InsightAPI, 'sources', 1);
    }

    /**
     *  Retrieves the source data
     *  SourcesSnapshot describing it.
     */
    public getSourcesSnapshot(accountId: string, deploymentId: string, searchParams: any = null): Observable<SourceSnapshot> {

        return new Observable(observable => {
            super.request("GET", this.buildUrl(accountId, deploymentId), searchParams)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(SourceSnapshot.import(response));
                    observable.complete();
                }, error => {
                    observable.error(error);
                    observable.complete();
                });
        });
    }

    /**
     * Retrives one
     */
    public getOne(accountId: string, deploymentId: string): Observable<SourceDescriptor> {
        return new Observable(observable => {
            let url = accountId + "/" + SourcesService.resource + "/" + deploymentId;
            super.request("GET", url)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(SourceDescriptor.import(response.source));
                    observable.complete();
                }, error => {
                    observable.error(error);
                    observable.complete();
                });
        });
    }

    public getSources( url: string ) {

        const searchParams = new URLSearchParams();
        searchParams.append('source.type', 'environment');
        searchParams.append('source.config.aws.defender_support', '!true');
        searchParams.append('source.config.collection_type', 'aws');
        searchParams.append('source.config.collection_method', 'api');

        return super.get(url, null, searchParams);
    }

    public getAllSources(customerID: any, entityType: string, params: Object = {}): Observable<Array<SourceDescriptor>> {
        return new Observable( observable => {
            let endpoint: string = `${customerID}/${entityType}`;
            super.request( "GET", endpoint, params )
                    .asJson()
                    .execute().pipe(
                    pluck('sources'),
                    map( response => {
                        return SourceDescriptor.importArray(response);
                    }),).subscribe( response => {
                        observable.next( response );
                        observable.complete();
                    }, error => {
                        observable.error( error );
                        observable.complete();
                    });
        });
    }

    public getCustomerSources(collectionTypes = ['aws'], filterDefenderSupport = true , customerID: any = null): Observable<Array<SourceDescriptor>> {
        if( customerID === null || customerID === undefined ) {
            customerID = this.actingAccountId;
        }
        let entityType: string = 'sources';
        let params: Object = { "source.type": "environment",
                               "source.config.collection_type": collectionTypes.join(','),
                               "source.config.collection_method": "api",
                               "source.enabled": "true",
                               "source.product_type": "outcomes" };
        if( filterDefenderSupport ) {
            params["source.config.aws.defender_support"] = "!true";
        }
        return this.getAllSources(customerID, entityType, params);
    }

    public getSourcesArray( url: string ): Observable<Array<any>> {
        return this.getSources(url).pipe(map(
                    (sources) => {
                        let activeSourcesArray: Array<any> = [];
                        for ( var i = 0; i < sources.sources.length; i++ ) {
                            var source = sources.sources[i].source;
                            if ( source.enabled && source.product_type === 'outcomes' && source.type === 'environment' ) {
                                activeSourcesArray[source.id] = source;
                            }
                        }
                        return activeSourcesArray;
                    }));
    }

    private buildUrl(accountId: string, deploymentId: string) {
        return deploymentId ? accountId + "/" + SourcesService.resource + "/" + deploymentId : accountId + "/" + SourcesService.resource;
    }

    public putSource(accountId: string, deploymentId: string, data: any) {
        return super.put(this.buildUrl(accountId, deploymentId), data);
    }

    public deleteSource(accountId: string, deploymentId: string) {
        return super.delete(this.buildUrl(accountId, deploymentId));
    }

    //========SOURCE REFERENCE TRACKING==========
    public startSourceTracking() {
        this.source = new SourceSnapshot();
    }

    public getSourceOnTracking() {
        return this.source;
    }

    public setSourceOnTracking(source: SourceSnapshot) {
        this.source.source = source.source;
        this.source.sourceByKey = source.sourceByKey;
    }

    public destroySourceOnTracking() {
        this.source = null;
    }
    //===========================================
    //======== SOURCES' CREDENTIALS==========
    /**
     *  Retrieves the all the credentials values
     */
    public getSourcesCredentials(accountId: string, searchParams: any = null, topologyOnly: boolean = false): Observable<CredentialsHostScanSnapshot> {
        return new Observable(observable => {
            let url = accountId + "/credentials";
            super.request("GET", url, searchParams)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(CredentialsHostScanSnapshot.importSourcesCredentials(response, topologyOnly));
                    observable.complete();
                }, error => {
                    observable.error(error);
                    observable.complete();
                });
        });
    }

}

