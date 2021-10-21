import { AlDefaultClient } from '@al/core';
import { Injectable } from '@angular/core';

interface ResourceDictionary {
    [key:string]:string;
}

@Injectable( { providedIn: 'root' } )
export class AppResourcesService
{
    protected resourceDictionary:Promise<ResourceDictionary> = null;

    constructor() {
    }

    public async getResource( resourceKey:string ):Promise<string> {
        let dictionary = await this.getResources();
        if ( dictionary.hasOwnProperty( resourceKey ) ) {
            return dictionary[resourceKey];
        }
        throw new Error(`Invalid resource: resource with key '${resourceKey}' could not be retrieved from dictionary.` );
    }

    public async getResourceObject<Type=any>( resourceKey:string ):Promise<Type> {
        let dictionary = await this.getResources();
        if ( dictionary.hasOwnProperty( resourceKey ) ) {
            return dictionary[resourceKey] as unknown as Type;      //  <-- big pile of horse puckey
        }
        throw new Error(`Invalid resource: resource with key '${resourceKey}' could not be retrieved from dictionary.` );
    }

    protected getResources():Promise<ResourceDictionary> {
        if ( ! this.resourceDictionary ) {
            this.resourceDictionary = AlDefaultClient.get( { url: "/assets/resource-dictionary.json", withCredentials: false } );
        }
        return this.resourceDictionary;
    }
}

