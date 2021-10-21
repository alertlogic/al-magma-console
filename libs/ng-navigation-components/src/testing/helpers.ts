import {
    AIMSSessionDescriptor,
    AlEntitlementCollection,
    AlRuntimeConfiguration, ConfigOption,
    AlSession,
} from '@al/core';

export async function setAuthState( accountId:string|null = '2', actingAccountId:string = '2', userId:string = '1001-ABCDEF00-10105060-1234' ) {
    if ( accountId === null ) {
        AlSession.deactivateSession();
        return null;
    }
    let nowTS = Date.now() / 1000;
    let sessionData:AIMSSessionDescriptor = {
        authentication: {
            user: {
                id: userId,
                name: 'Mister McNielsen',
                email: 'mcnielsen@alertlogic.com',
                active: true,
                locked: false,
                version: 1002,
                linked_users: [],
                created: {
                    at: 123456789,
                    by: 'McNielsen',
                },
                modified: {
                    at: 123456790,
                    by: 'Warsaw',
                }
            },
            account: {
                id: accountId,
                name: "Kevin's Fast Company",
                active: true,
                accessible_locations: [
                    "defender-us-denver",
                    "insight-us-virginia"
                ],
                default_location: 'defender-us-denver',
                created: {
                    at: 123456789,
                    by: 'McNielsen',
                },
                modified: {
                    at: 123456790,
                    by: 'Warsaw',
                }
            },
            token: 'BigFatFakeToken',
            token_expiration: nowTS + 86400,
        }
    };

    if ( actingAccountId !== accountId ) {
        sessionData.acting = Object.assign( {}, sessionData.authentication.account );
        sessionData.acting.id = actingAccountId;
        sessionData.acting.name = "Kevin's Slow Company";
    }

    AlRuntimeConfiguration.setOption( ConfigOption.ResolveAccountMetadata, false );

    return AlSession.setAuthentication( sessionData );
}

export async function timeoutPromise( delay:number ):Promise<void> {
    return new Promise( ( resolve, reject ) => {
        setTimeout( () => {
            resolve();
        }, delay );
    } );
}

export function createEntitlementSet( entitlements:string[] = [] ) {
    return new AlEntitlementCollection( entitlements.map( entitlementId => {
        let date = new Date();
        date.setDate( date.getDate() + 1 );
        return {
            productId: entitlementId,
            active: true,
            expires: date
        };
    } ) );
}
