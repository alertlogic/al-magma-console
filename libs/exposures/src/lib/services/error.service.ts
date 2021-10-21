import { Injectable } from '@angular/core';

@Injectable()
export class ErrorService {

    public messages = {
        'exposures': {
            "generic": {
                "error_400": "There was an issue processing your request. Please try again later. If this error continues, contact Alert Logic Support.",
                "error_404": "No results matched your request.  If you believe this is an error, contact Alert Logic Support.",
                "error_403": "You do not have the appropriate user role permission to access this page. If you believe this is an error, contact Alert Logic Support."
            }
        },
        'deployments': {
            "generic": {
                "error_404": "There was an issue processing your request. Please try again later. If this error continues, contact Alert Logic Support."
            }
        }
    };

    constructor(){}

    /**
     * Return the default message to show to the customer
     *  @param {string} api iris or retina
     *  @param {string} subapi
     *  @param {string} key word
     *  @returns {string} message
    */
    public getMessage = ( api, subApi, key ):string => {
        // default message
        let msg = "An internal error occurred while processing your request. Please try again later.  If this error continues, contact Alert Logic Support.";

        if( this.messages.hasOwnProperty( api ) ) {
            if( this.messages[ api ].hasOwnProperty( subApi ) ) {
                if( this.messages[ api ][ subApi ].hasOwnProperty( key ) ) {
                    return this.messages[ api ][ subApi ][ key ];
                }
            }
        }

        return msg;
    }
}
