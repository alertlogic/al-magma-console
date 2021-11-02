/**
 *  BaseAPIClient class.  Provides a base class for clients of Alert Logic APIs with standard pathing
 *  assumptions and several convenience features.
 *
 *  @author McNielsen (knielsen@alertlogic.com)
 *
 *  @copyright Alert Logic Inc, 2017.
 */

import { BaseAPIClient, ResponseTransformer } from '../services';
import { HttpHeaders, HttpParams } from "@angular/common/http";
import { AlDefaultClient, APIRequestParams } from '@al/core';
import { Method, ResponseType, AxiosResponse } from 'axios';
import { Observable, from } from 'rxjs';

export declare interface BaseAPIDescriptor {
    serviceSite:string;
    serviceName:string;
    serviceVersion?:number;
}

export const MaximumCachableSize = 1024 * 256;       //  just don't cache anything huge, okay?

/**
 *  A utility class to assist in building a request in a caller-friendly manner.
 *  See services/BaseAPIClient for more information.
 */
export class RequestBuilder {

    protected _apiClient:BaseAPIClient = null;

    public config:APIRequestParams = {
        headers: {},
        params: {}
    };

    _transformers:Array<ResponseTransformer> = [];

    constructor( apiClient:BaseAPIClient, url:string = null, method:Method = "GET", params?:any ) {
        this._apiClient = apiClient;
        this.config.path = url || null;
        this.config.method = method || "GET";
        this.config.service_stack = apiClient.serviceSite || "insight:api";
        this.config.service_name = apiClient.serviceName || "";
        this.config.version = apiClient.serviceVersion;

        if(params !== undefined){
            this.config.params = Object.assign( this.config.params, params );
        }
    }

    /**
     *  Allow access to the underlying API Client service
     */

    public method( method:Method ):RequestBuilder {
        this.config.method = method;
        return this;
    }

    public url( url:string ):RequestBuilder {
        this.config.url = url;
        return this;
    }

    public base( serviceStack:string, serviceName:string = null, serviceVersion:number = null ) {
        this.config.service_stack = serviceStack;
        this.config.service_name = serviceName;
        if ( serviceVersion !== null ) {
            this.config.version = serviceVersion;
        }
        return this;
    }

    public baseUrl( baseUrl:string ):RequestBuilder {
        this.config.baseURL = baseUrl;
        return this;
    }

    public data( data:any ):RequestBuilder {
        this.config.data = data;
        return this;
    }

    public responseType( responseType:ResponseType ):RequestBuilder {
        this.config.responseType = responseType;
        return this;
    }

    public header( header:string, value:string|string[] ):RequestBuilder {
        this.config.headers[header] = value;
        return this;
    }

    public paramIf( expression:boolean, parameter:string, value:string|number ):RequestBuilder {
        if ( expression ) {
            this.param( parameter, value );
        }
        return this;
    }

    public param( parameter:string, value:string|number ):RequestBuilder {
        this.config.params[parameter] = value.toString();
        return this;
    }

    public withCredentials():RequestBuilder {
        this.config.withCredentials = true;
        return this;
    }

    public withoutCredentials():RequestBuilder {
        this.config.withCredentials = false;
        return this;
    }

    public transform( transformer:ResponseTransformer ):RequestBuilder {
        this._transformers.push( transformer );
        return this;
    }

    /**
     * deprecated
     * This logic is already incorporated into the @al/core base client by default.
     */
    public useEndpointsResolution( accountId:string = null, residency:string = null ):RequestBuilder {
        return this;
    }

    public disableEndpointResolution() {
        this.config.noEndpointsResolution = true;
        return this;
    }

    public enableAutoRetry( maxRetryCount:number ) {
        this.config.retry_count = maxRetryCount;
        return this;
    }

    /**
     *  Utility method to force the request to be transformed to JSON
     */
    public asJson():RequestBuilder {
        this._transformers.push(    response => {
                                        if ( typeof( response ) !== 'object' ) {
                                            throw new Error("Invalid transformation: json transformer requires that the provided object be a Response object with a json method." );
                                        }
                                        return response.data;
                                    } );
        return this;
    }

    public execute():Observable<any> {
        return from( this._execute() );
    }

    protected async _execute() {
        let response:AxiosResponse<any>;
        if ( this.config.method === 'GET' || this.config.method === 'get' ) {
            response = await AlDefaultClient.rawGet( this.config );
        } else if ( this.config.method === 'POST' || this.config.method === 'post' ) {
            response = await AlDefaultClient.rawPost( this.config );
        } else if ( this.config.method === 'PUT' || this.config.method === 'put' ) {
            response = await AlDefaultClient.rawPut( this.config );
        } else if ( this.config.method === 'DELETE' || this.config.method === 'delete' ) {
            response = await AlDefaultClient.rawDelete( this.config );
        } else {
            let normalizedRequest = await AlDefaultClient.normalizeRequest( this.config );
            response = await AlDefaultClient.doRequest( normalizedRequest.method, normalizedRequest );
        }

        this._transformers.forEach( transformer => {
            response = transformer( response );
        } );
        return response;
    }
}
