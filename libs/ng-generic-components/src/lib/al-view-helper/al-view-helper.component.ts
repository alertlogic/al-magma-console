/**
 * View Helper Component - supports load indicators, zero states, error states, and view-level notifications.
 *
 * @author Maryit Sanchez <msanchez@alertlogic.com>
 * @author McNielsen <knielsen@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */
import { AlDefaultClient, AlDataValidationError, AlWrappedError } from '@al/core';
import { AxiosResponse } from 'axios';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { AlNotificationPanelComponent } from '../al-notification-panel/al-notification-panel.component';
import {
    AlNotification,
    AlNotificationType,
} from '../types';

@Component({
    selector: 'al-view-helper',
    templateUrl: './al-view-helper.component.html',
    styleUrls: ['./al-view-helper.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlViewHelperComponent implements OnChanges {

    /**
     * Indicates whether the loading animation should be displayed.
     */
    @Input() loading: boolean       =   false;

    /**
     * Indicates whether the zero state should be displayed.
     */
    @Input() empty: boolean         =   false;

    /**
     * Zero state flavor, that has different background,color or is wrapped in a card
     * default whiteBg shadowCard
     */
    @Input() zeroStateFlavor = 'default';

    /**
     * If set to false, no notification container will be emitted as part of the helper.
     */
    @Input() notifyPanel: boolean   =   true;

    /**
     * Indicates whether or not the error state should be displayed.  Different types
     * of error objects will generate various types of additional details (e.g., `Error` instances
     * will show a stack trace when "Show Details" is expanded, response descriptors will show the
     * HTTP error and request details, etc.)
     */
    @Input() error?:string|Error|AxiosResponse;

    /**
     * If provided, when the view is in error state, a "Try Again" button will be shown.  Clicking this
     * will call the provided method (if it is callable) or emit a notification via the retry @Output().
     */
    @Input() retryHandler?:Function|boolean;        //  if provided, a "Try Again" button will be displayed in the error state and clicking it will clear the error before trying again.

    /**
     * If retryHandler === true, this event emitter will be used to communicate that the user has clicked
     * the try again button.
     * */
    @Output() retry                 =   new EventEmitter<void>();

    @Output() notifications         =   new EventEmitter<AlNotification>();

    @ViewChild(AlNotificationPanelComponent) notificationsPanel: AlNotificationPanelComponent;

    public errorTitle:string = "Something is wrong";
    public errorDescription?:string;
    public showError?:boolean;
    public showErrorDetails?:boolean;
    public errorDetails?:string;

    ngOnChanges( changes:SimpleChanges ) {
        if ( changes.hasOwnProperty("error" ) ) {
            this.setError( changes.error.currentValue );
        }
    }

    /**
     *  Turns the empty/zero-state mode on.
     */
    public enableZeroState() {
        this.empty = true;
    }

    /**
     *  Turns the loading indicator on.
     */
    public startLoading() {
        this.loading = true;
    }

    /**
     *  Turns the loading indicator off.
     */
    public stopLoading() {
        this.loading = false;
    }

    /**
     *  Emits a notification
     */
    public notify(text: string, type: AlNotificationType, autoDismiss: number = 0) {
        this.notifications.emit(new AlNotification(text, type, autoDismiss));
    }

    /**
     *  Emits an info-style notification.
     */
    public notifyInfo(text: string, autoDismiss: number = 0, flush: boolean = false) {
        this.notifications.emit(AlNotification.info(text, autoDismiss, flush));
    }

    /**
     *  Emits a warning notification.
     */
    public notifyWarning(text: string, autoDismiss: number = 0, flush: boolean = false) {
        this.notifications.emit(AlNotification.warning(text, autoDismiss, flush));
    }

    /**
     *  Emits an error notification.
     */
    public notifyError(text: string, autoDismiss: number = 0, flush: boolean = false) {
        this.notifications.emit(AlNotification.error(text, autoDismiss, flush));
    }

    /**
     *  Emits an success notification.
     */
    public notifySuccess(text: string, autoDismiss: number = 0, flush: boolean = false) {
        this.notifications.emit(AlNotification.success(text, autoDismiss, flush));
    }

    /**
     * Clean the notification panel
     */
    public cleanNotifications() {
        if (this.notificationsPanel) {
            this.notificationsPanel.flush();
        }
    }

    /**
     * Sets a view error.
     */
    public setError( error?:any ) {
        if ( ! error ) {
            return this.clearError();
        }
        if ( typeof( error ) === 'string' ) {

            //  Undescriptive string as an error.  Who still does this, anyway?
            this.errorDescription = error;

        } else if ( AlDefaultClient.isResponse( error ) ) {

            //  This error is an HTTP response descriptor, indicating an API error has occurred -- format appropriately
            this.errorDescription = this.getResponseDescription( error.status, error.statusText );
            this.errorDetails = JSON.stringify( this.compactErrorResponse( error ), null, 4 );

        } else if ( error instanceof AlDataValidationError ) {

            //  This error is a data validation error, indicating we retrieved data but it wasn't the data we expected
            this.errorTitle = "Unexpected Response";
            this.errorDescription = error.message;
            let details = this.compactDataValidationError( error );
            this.errorDetails = JSON.stringify( details, null, 4 );

        } else if ( error instanceof AlWrappedError ) {

            //  This error is an outer error with a reference to an inner exception.
            this.errorDescription = this.consolidateWrappedErrorDescription( error );
            this.errorDetails = JSON.stringify( this.compactWrappedError( error ), null, 4 );

        } else if ( error instanceof Error ) {

            //  Generic Error object
            this.errorDescription = error.message;
            this.errorDetails = JSON.stringify( this.compactError( error ), null, 4 );

        } else {

            //  What on earth...
            this.errorDescription = "An unknown error prevented this view from rendering.  If this persists, please contact Alert Logic support for assistance.";
        }
        this.showError = true;
    }

    compactDataValidationError( error:AlDataValidationError ):any {
        return this.compactError( error, "Data Validation Error", {
            validationSchemaId: error.schemaId,
            errors: error.validationErrors || [],
            dataOrigin: error.request ? `${error.request.method} [${error.request.url}]` : 'Not Available'
        } );
    }

    compactErrorResponse( response:AxiosResponse<any> ):any {
        return response;
    }

    compactWrappedError( error:AlWrappedError ):any {
        let cursor = error;
        let stack = [];
        while( cursor ) {
            if ( AlDefaultClient.isResponse( cursor ) ) {
                stack.push( this.compactErrorResponse( cursor ) );
            } else if ( cursor instanceof AlDataValidationError ) {
                stack.push( this.compactDataValidationError( cursor ) );
            } else if ( cursor instanceof Error ) {
                stack.push( this.compactError( cursor ) );
            } else if ( typeof( cursor ) === 'string' ) {
                stack.push( cursor );
            } else {
                stack.push( "Eggplant Parmesiano with Spider Eggs" );
            }
            cursor = cursor instanceof AlWrappedError ? cursor.getInnerError() : null;
        }
        return stack;
    }

    compactError( error:Error, type:string = "Error", otherProperties?:any ):any {
        let compact:any = {
            type,
            message: error.message,
            stack: error.stack ? error.stack.split( "\n" ).map( line => line.trim() ) : null
        };
        if ( otherProperties ) {
            Object.assign( compact, otherProperties );
        }
        return compact;
    }

    consolidateWrappedErrorDescription( error:AlWrappedError|Error|AxiosResponse|string ) {
        let description = '';
        let cursor = error;
        while( cursor ) {
            if ( description.length > 0 ) {
                description += `: `;
            }
            if ( cursor instanceof Error ) {
                description += cursor.message;
            } else if ( AlDefaultClient.isResponse( cursor ) ) {
                description += this.getResponseDescription( cursor.status, cursor.statusText );
            } else if ( typeof( cursor ) === 'string' ) {
                description += cursor;
            }
            cursor = cursor instanceof AlWrappedError ? cursor.getInnerError() : null;
        }
        return description;
    }

    /**
     * Clears the error state
     */
    public clearError() {
        this.error = undefined;
        this.errorDescription = undefined;
        this.errorDetails = undefined;
        this.showError = false;
        this.showErrorDetails = false;
    }

    /**
     * Clears the error state and calls the host-provided "try again" function
     */
    public attemptReload($event:Event) {
        if ( typeof( this.retryHandler ) === 'function' ) {
            console.warn("Notice: user has initiated a reload of the current view.  Clearing error state and retrying." );
            this.clearError();
            this.retryHandler();
        } else if ( typeof( this.retryHandler ) === 'boolean' ) {
            this.retry.emit();
        }
    }

    /**
     * TODO(kjn): hook this up to the content service, when it's available, and use content from there instead of here :)
     */
    protected getResponseDescription( status:number, statusText:string, serviceName:string = "A service required by this view" ) {
        switch( status ) {
            case 400 :
                return `${serviceName} doesn't appear to understand one of our requests.  If this condition persists, please contact Alert Logic support.`;
            case 401 :
                return `${serviceName} doesn't appear to be accepting our identity or authentication state.  If this condition persists after reauthenticating, please contact Alert Logic support.`;
            case 403 :
                return `${serviceName} is denying our authorization to access its data.  If this condition persists after reauthenticating, please contact Alert Logic support.`;
            case 404 :
                return "The data you are trying to access doesn't appear to exist.  If you are certain this is an error and the condition persists, please contact Alert Logic support.";
            case 410 :
                return "The data you're trying to access doesn't appear to exist anymore.  If you are certain this is an error and the condition persists, please contact Alert Logic support.";
            case 418 :
                return "Sadly, the data you're looking for has turned into a teapot.  Tragic but delicious!";
            case 500 :
                return `${serviceName} has experienced an unexpected internal error.  If this condition persists, please contact Alert Logic support.`;
            case 502 :
                return `${serviceName} has failed because of an unexpected response from an upstream service.  If this condition persists, please contact Alert Logic support.`;
            case 503 :
                return `${serviceName} is currently unavailable.  If this condition persists, please contact Alert Logic support.`;
            case 504 :
                return `${serviceName} is not responding quickly enough.  If this condition persists, please contact Alert Logic support.`;
            default :
                return `${serviceName} responded in an unexpected way (${status}/${statusText}).  If this condition persists, please contact Alert Logic support.`;
        }
    }
}
