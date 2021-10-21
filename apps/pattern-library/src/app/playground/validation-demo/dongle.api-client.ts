import { AlDefaultClient, AlValidationSchemaProvider } from '@al/core';

export interface DongleDescriptor {
    id: string;
    name: string;
}

import { dongleTypeSchematics } from './dongle.schematics';

export class DongleAPIClient implements AlValidationSchemaProvider {
    constructor() {
    }

    public async getDongle( dongleId:string ):Promise<DongleDescriptor> {
        return await AlDefaultClient.get( {
            url: `/assets/demo/validation/dongle.${dongleId}.json`,
            validation: {
                schema: 'https://alertlogic.com/schematics/dongle#definitions/dongle',
                providers: [ this ]
            }
        } ) as DongleDescriptor;
    }

    public async getDongles( listId:string ):Promise<DongleDescriptor[]> {
        let result = await AlDefaultClient.get( {
            url: `/assets/demo/validation/dongle.${listId}.json`,
            validation: {
                schema: 'https://alertlogic.com/schematics/dongle#definitions/dongleList',
                providers: [ this ]
            }
        } );
        return result.dongles as DongleDescriptor[];
    }

    public hasSchema( schemaId:string ) {
        return ( schemaId in dongleTypeSchematics );
    }

    public getSchema( schemaId:string ) {
        return dongleTypeSchematics[schemaId];
    }

    public getProviders() {
        return [ AlDefaultClient ];
    }
};
