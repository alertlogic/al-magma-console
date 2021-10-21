import {
    AlContentBundle,
    AlDefaultClient,
    AlLocation,
    AlRuntimeConfiguration,
    ConfigOption,
    isPromiseLike,
} from '@al/core';
import { Injectable } from '@angular/core';
import {
    DomSanitizer,
    SafeHtml,
} from '@angular/platform-browser';

/**
 * External resources may be either bundled (a collection of many small resources, each with its own type and metadata) or raw, standalone files.
 *
 * Bundled resources are referenced using this format:
 *
 *  categoryId:bundleId#itemId.
 *
 * Raw resources are referenced using this format:
 *
 *  categoryId:filePath.fileExtension
 */

@Injectable({
    providedIn: 'root',
})
export class AlExternalContentManagerService
{
    protected localResourcePath?:string = undefined;
    protected bundles:{[bundleKey:string]:Promise<AlContentBundle>} = {};
    protected rawResourceIdMatcher = /^(.*)\:(.*)\.([a-z0-9]+)$/mi;
    protected bundledResourceIdMatcher = /^(.*)\:(.*)#(.*)$/mi;
    protected typeDictionary:{[type:string]:{contentType:string,fileExtension:string}} = {
        text: {
            contentType: "text/plain",
            fileExtension: "txt"
        },
        html: {
            contentType: "text/html",
            fileExtension: "html"
        },
        json: {
            contentType: "application/json",
            fileExtension: "json"
        },
        markdown: {
            contentType: "text/markdown",
            fileExtension: "md"
        }
    };

    constructor( public sanitizer:DomSanitizer ) {
        if ( AlRuntimeConfiguration.getOption<boolean>( ConfigOption.LocalManagedContent, false ) ) {
            let basePath = AlRuntimeConfiguration.getOption<string>( ConfigOption.ManagedContentAssetPath );
            this.useLocalResources( basePath || "/assets/content" );
        }
    }

    /**
     * This allows external content to be tested without modifying ui-static-content or gestalt API
     */
    public useLocalResources( basePath:string ) {
        this.localResourcePath = basePath;
    }

    public async getTextResource( resourceId:string, defaultText?:string ):Promise<string> {
        try {
            return await this.getResource( resourceId, "text" );
        } catch( e ) {
            console.warn(`Warning: could not utilize textual resource '${resourceId}': `, e );
            return defaultText || "(missing)";
        }
    }

    public async getHtmlResourceAsText( resourceId:string, defaultHtml?:string, transformer?:{(text:string):string|PromiseLike<string>} ):Promise<string> {
        try {
            let content = await this.getResource( resourceId, "html" );
            if ( transformer ) {
                let transformed = transformer( content );
                content = isPromiseLike( transformed ) ? await transformed : transformed;
            }
            return content;
        } catch( e ) {
            console.warn(`Warning: could not utilize html resource '${resourceId}': `, e );
            return defaultHtml || "<em>(missing)</em>";
        }
    }

    public async getHtmlResource( resourceId:string, defaultHtml?:string, transformer?:{(text:string):string|PromiseLike<string>} ):Promise<SafeHtml> {
        let htmlString = await this.getHtmlResourceAsText( resourceId, defaultHtml, transformer );
        return this.sanitizer.bypassSecurityTrustHtml( htmlString );
    }

    public async getJsonResource<StructureType=any>( resourceId:string, defaultValue?:StructureType ):Promise<StructureType> {
        try {
            return await this.getResource<any>( resourceId, "json" ) as StructureType;
        } catch( e ) {
            console.warn(`Warning: could not retrieve json resource '${resourceId}': `, e );
            if ( typeof( defaultValue ) === 'undefined' ) {
                throw new Error(`Error: could not retrieve JSON resource '${resourceId} and no default value was provided.` );
            } else {
                return defaultValue;
            }
        }
    }

    public async getResource<Type=string>( resourceId:string, assertedType?:string ):Promise<Type> {
        let resource:Type;
        if ( this.isRawResource( resourceId ) ) {
            resource = await this.getRawResource( resourceId, assertedType );
        } else if ( this.isBundledResource( resourceId ) ) {
            resource = await this.getBundledResource( resourceId, assertedType );
        } else {
            throw new Error(`Invalid resource: '${resourceId}' is not a valid resource identifier.` );
        }
        return resource;
    }

    public isValidResource( resourceId:string ):boolean {
        return this.isRawResource( resourceId ) || this.isBundledResource( resourceId );
    }

    protected async getRawResource<Type=string>( resourceId:string, assertedType?:string ):Promise<Type> {
        const parsed = this.parseRawResourceIdentifier( resourceId );
        if ( assertedType ) {
            if ( ! ( assertedType in this.typeDictionary ) ) {
                throw new Error(`Cannot retrieve resource '${resourceId}' as type '${assertedType}'; not a valid type.` );
            }
            if ( parsed.fileExtension !== this.typeDictionary[assertedType].fileExtension ) {
                throw new Error(`Cannot retrieve resource '${resourceId}' as ${assertedType}; file extension mismatch` );
            }
        }
        return this.retrieveResource( `${parsed.categoryId}/${parsed.filePath}.${parsed.fileExtension}` );
    }

    protected async getBundledResource<Type=string>( resourceId:string, assertedType?:string ):Promise<Type> {
        const idParts = this.parseBundledResourceIdentifier( resourceId );
        const bundle = await this.getContentBundle( idParts.categoryId, idParts.bundleId );
        if ( ! bundle.hasOwnProperty( 'resources' ) || ! bundle.resources.hasOwnProperty( idParts.itemId ) ) {
            throw new Error(`Invalid resource: the bundle '${idParts.categoryId}:${idParts.bundleId}' does not contain an item '${idParts.itemId}'` );
        }
        if ( assertedType ) {
            if ( ! ( assertedType in this.typeDictionary ) ) {
                throw new Error(`Cannot retrieve resource '${resourceId}' as type '${assertedType}'; not a valid type.` );
            }
            if ( bundle.resources[idParts.itemId].contentType !== this.typeDictionary[assertedType].contentType ) {
                throw new Error(`Cannot retrieve resource '${resourceId}' as ${assertedType}; content type mismatch` );
            }
        }
        return bundle.resources[idParts.itemId].content;
    }


    protected async getContentBundle( categoryId:string, bundleId:string ):Promise<AlContentBundle> {
        const bundleKey = `${categoryId}:${bundleId}`;
        if ( ! this.bundles.hasOwnProperty( bundleKey ) ) {
            this.bundles[bundleKey] = this.retrieveResource( `${categoryId}/${bundleId.replace(/\./gi, '/')}.bundle.json` );
        }
        return this.bundles[bundleKey] as Promise<AlContentBundle>;
    }

    protected async retrieveResource( resourcePath:string ):Promise<any> {
        if ( this.localResourcePath ) {
            return AlDefaultClient.get( {
                url: `${this.localResourcePath}/${resourcePath}`
            } );
        } else {
            return AlDefaultClient.get( {
                service_stack: AlLocation.GestaltAPI,
                service_name: 'content',
                version: 1,
                path: resourcePath,
                withCredentials: false
            } );
        }
    }

    protected isRawResource( resourceId:string ):boolean {
        return this.rawResourceIdMatcher.test( resourceId );
    }

    protected isBundledResource( resourceId:string ):boolean {
        return this.bundledResourceIdMatcher.test( resourceId );
    }

    protected parseRawResourceIdentifier( resourceId:string ):{categoryId:string,filePath:string,fileExtension:string} {
        const matches = this.rawResourceIdMatcher.exec( resourceId );
        if ( matches && matches.length >= 4 ) {
            return {
                categoryId: matches[1],
                filePath: matches[2],
                fileExtension: matches[3]
            };
        }
        throw new Error(`Cannot use invalid/malformed resourceId '${resourceId}'` );
    }

    protected parseBundledResourceIdentifier( resourceId:string ):{categoryId:string,bundleId:string,itemId:string} {
        const matches = this.bundledResourceIdMatcher.exec( resourceId );
        if ( matches && matches.length >= 4 ) {
            return {
                categoryId: matches[1],
                bundleId: matches[2],
                itemId: matches[3]
            };
        }
        throw new Error(`Cannot use invalid/malformed bundled resourceId '${resourceId}'` );
    }
}
