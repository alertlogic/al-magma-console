/**
 * CredentialsInsightService
 *
 * @author Julian David <jgalvis@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2018
 */
import { Injectable } from '@angular/core';
import { BaseAPIClient } from './base.apiclient';
import { AlLocation } from '@al/core';
import { CredentialsInsightSnapshot, CredentialsInsightDescriptor } from '../types';
import { Observable } from 'rxjs';

@Injectable()
export class CredentialsInsightService extends BaseAPIClient {

    static resource: string = "credentials";
    public credential_discover: CredentialsInsightDescriptor;
    public credential_x_account_monitor: CredentialsInsightDescriptor;

    constructor() {
        /*  See APIClientBaseService. */
        super(AlLocation.InsightAPI, 'credentials', 2);
    }

    /**
     *  Retrieves the credentials
     */
    public getAll(accountId: string, params: object): Observable<CredentialsInsightSnapshot> {
        return new Observable(observable => {
            let url = accountId + "/" + CredentialsInsightService.resource;
            super.request("GET", url, params)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(CredentialsInsightSnapshot.import(response));
                    observable.complete();
                }, error => {
                    observable.error(error);
                    observable.complete();
                });
        });
    }
    /**
     * Retrives one credential
     */
    public getOne(accountId: string, credential_id: string): Observable<CredentialsInsightDescriptor> {
        return new Observable(observable => {
            let url = accountId + "/" + CredentialsInsightService.resource + "/" + credential_id;
            super.request("GET", url)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(CredentialsInsightDescriptor.import(response));
                    observable.complete();
                }, error => {
                    observable.error(error);
                    observable.complete();
                });
        });
    }
    /**
     * Retrives one credential decrypted
     */
    public getOneDecrypted(accountId: string, credential_id: string): Observable<CredentialsInsightDescriptor> {
        return new Observable(observable => {
            let url = accountId + "/" + CredentialsInsightService.resource + "/" + credential_id + "/decrypted";
            super.request("GET", url)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(CredentialsInsightDescriptor.import(response));
                    observable.complete();
                }, error => {
                    observable.error(error);
                    observable.complete();
                });
        });
    }
    /**
     * Deletes a credential
     */
    public deleteOne(accountId: string, credential_id: string): Observable<any> {
        return new Observable(observable => {
            let url = accountId + "/" + CredentialsInsightService.resource + "/" + credential_id;
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
     * Creates a new credential
     */
    public create(accountId: string, policy: object): Observable<CredentialsInsightDescriptor> {
        return new Observable(observable => {
            let url = accountId + "/" + CredentialsInsightService.resource;
            super.request("POST", url)
                .data(policy)
                .asJson()
                .execute()
                .subscribe(response => {
                    observable.next(CredentialsInsightDescriptor.import(response));
                    observable.complete();
                }, error => {
                    observable.error(error);
                    observable.complete();
                });
        });
    }

    //========CREDENTIAL REFERENCE TRACKING==========
    public startCredentialTracking() {
        this.credential_discover = new CredentialsInsightDescriptor();
        this.credential_x_account_monitor = new CredentialsInsightDescriptor();
    }

    public getCredentialOnTracking(purpose: string) {
        if (purpose === 'discover') {
            return this.credential_discover;
        }
        if (purpose === 'x-account-monitor') {
            return this.credential_x_account_monitor;
        }
    }

    public setCredentialOnTracking(credential: CredentialsInsightDescriptor, purpose: string) {
        if (purpose === 'discover') {
            this.credential_discover.id = credential.id;
            this.credential_discover.modified = credential.modified;
            this.credential_discover.name = credential.name;
            this.credential_discover.secrets = credential.secrets;
            this.credential_discover.created = credential.created;
        }
        if (purpose === 'x-account-monitor') {
            this.credential_x_account_monitor.id = credential.id;
            this.credential_x_account_monitor.modified = credential.modified;
            this.credential_x_account_monitor.name = credential.name;
            this.credential_x_account_monitor.secrets = credential.secrets;
            this.credential_x_account_monitor.created = credential.created;
        }
    }

    public destroyCredentialOnTracking() {
        this.credential_discover = null;
        this.credential_x_account_monitor = null;
    }

    /**
     * @param {string} deploymentId The environment identifier
     * @returns  An observable that will either be resolved with all the credentials used for
     *                    scanning every single host in the environment, or rejected with
     *                    the appropriate error code.
     */
    getList = ( deploymentId ): Observable<any> => {
        return this.get( `${this.actingAccountId}/${deploymentId}/host/scan`, null);
    }

}
