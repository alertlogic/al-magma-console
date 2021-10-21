/**
 * External Content Directive
 *
 * @author Kevin <knielsen@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */
import {
    AlBundledContentDescriptor,
    AlContentBundle,
    AlDefaultClient,
    AlLocation,
    AlLocatorService,
    AlSession,
} from '@al/core';
import {
    Component,
    Input,
    OnChanges,
} from '@angular/core';
import {
    DomSanitizer,
    SafeHtml,
} from '@angular/platform-browser';

@Component({
    selector: 'al-external-content',
    templateUrl: './al-external-content.component.html',
    styleUrls: ['./al-external-content.component.scss']
})
export class AlExternalContentComponent implements OnChanges {

    @Input() type:"html"|"text"     =   "html";
    @Input() category:string        =   "alid";         //  Alert Logic Infodev
    @Input() bundleId:string;
    @Input() resourceId:string;

    public content:SafeHtml;

    constructor( public sanitizer:DomSanitizer ) {
    }

    ngOnChanges() {
        if ( this.category && this.bundleId && this.resourceId ) {
            this.retrieveExternalContent( this.category, this.bundleId, this.resourceId);
        }
    }

    public async retrieveExternalContent( category:string, bundleId:string, resourceId:string ) {
        await AlSession.resolved();
        const bundle = await AlDefaultClient.get( {
            url: AlLocatorService.resolveURL( AlLocation.GestaltAPI, `/content/v1/${category}/${bundleId}` ),
            withCredentials: false
        } ) as AlContentBundle;
        if ( bundle.hasOwnProperty( 'resources' ) && bundle.resources.hasOwnProperty( resourceId ) ) {
            this.installExternalContent( bundle.resources[resourceId] );
        } else {
            console.error("Invalid bundle: ", bundle );
            throw new Error(`Load error: ${category} bundle '${bundleId}' is not a valid bundle.` );
        }
    }

    public async installExternalContent( contentDescriptor:AlBundledContentDescriptor ) {
        if ( typeof( contentDescriptor ) !== 'object' || contentDescriptor.hasOwnProperty("content") === false || typeof( contentDescriptor.content ) !== 'string' ) {
            throw new Error(`Installation error: content is not of correct type!` );
        }
        let content = contentDescriptor.content as string;
        this.content = this.sanitizer.bypassSecurityTrustHtml( this.applyResourceAdjustments( content ) );
    }

    public applyResourceAdjustments( content:string ):string {
        content = content.replace( /\{\{link\((.*)\)\}\}/gi, ( match, parameterClause ) => {
            let params = parameterClause.split(",");
            return AlLocatorService.resolveURL( params[0], params[1] );
        } );
        return content;
    }
}
