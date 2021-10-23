/**
 * ExclusionsRulesService
 *
 * @author Julian David <jgalvis@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2018
 */
import { Injectable } from '@angular/core';
import { BaseAPIClient } from './base.apiclient';
import { AlLocation } from '@al/core';
import { ExclusionsRulesSnapshot, ExclusionsRulesDescriptor } from '../types';
import { Observable } from 'rxjs';

@Injectable()
export class ExclusionsRulesService extends BaseAPIClient {

    static resource: string = "rules";
    public exclusionRules: Map<string, ExclusionsRulesDescriptor>;

    constructor() {
        /*  See APIClientBaseService. */
        super(AlLocation.InsightAPI, 'exclusions', 1);
    }

    /**
     *  Retrieves all
     */
    public getAll(accountId: string, deploymentId: string, searchParams: any = null): Observable<ExclusionsRulesSnapshot> {

        return new Observable(observable => {
            let url = accountId + "/" + deploymentId + "/" + ExclusionsRulesService.resource;
            super.request("GET", url, searchParams)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(ExclusionsRulesSnapshot.import(response));
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
    public getOne(accountId: string, deploymentId: string, id: string): Observable<ExclusionsRulesDescriptor> {
        return new Observable(observable => {
            let url = accountId + "/" + deploymentId + "/" + ExclusionsRulesService.resource + "/" + id;
            super.request("GET", url)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(ExclusionsRulesDescriptor.import(response));
                    observable.complete();
                }, error => {
                    observable.error(error);
                    observable.complete();
                });
        });
    }
    /**
     * Deletes one
     */
    public deleteOne(accountId: string, deploymentId: string, id: string): Observable<any> {
        return new Observable(observable => {
            let url = accountId + "/" + deploymentId + "/" + ExclusionsRulesService.resource + "/" + id;
            super.request("DELETE", url)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(response);
                    observable.complete();
                }, error => {
                    observable.error(error);
                    observable.complete();
                });
        });
    }
    /**
     * Creates a new
     */
    public create(accountId: string, deploymentId: string, data: object): Observable<ExclusionsRulesDescriptor> {
        return new Observable(observable => {
            let url = accountId + "/" + deploymentId + "/" + ExclusionsRulesService.resource;
            super.request("POST", url)
                .data(data)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(ExclusionsRulesDescriptor.import(response));
                    observable.complete();
                }, error => {
                    observable.error(error);
                    observable.complete();
                });
        });
    }

    /**
     * Update
     */
    public update(accountId: string, deploymentId: string, id: string, data: object): Observable<ExclusionsRulesDescriptor> {
        return new Observable(observable => {
            let url = accountId + "/" + deploymentId + "/" + ExclusionsRulesService.resource + "/" + id;
            super.request("PUT", url)
                .data(data)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(ExclusionsRulesDescriptor.import(response));
                    observable.complete();
                }, error => {
                    observable.error(error);
                    observable.complete();
                });
        });
    }

    //========EXCLUSIONRULE REFERENCE TRACKING==========
    public startExclusionRuleTracking() {
        this.exclusionRules = new Map<string, ExclusionsRulesDescriptor>();
    }

    public getExclusionRulesOnTracking() {
        return this.exclusionRules;
    }

    public destroyExclusionRuleOnTracking() {
        this.exclusionRules = null;
    }
    //===========================================

}
