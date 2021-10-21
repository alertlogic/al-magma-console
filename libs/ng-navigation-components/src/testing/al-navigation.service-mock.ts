import {
    AlEntitlementCollection,
    AlLocationContext,
    AlRoute,
    AlTriggerStream,
} from '@al/core';

export class AlNavigationServiceMock {

    public queryParams:{[k:string]:string} = {};
    public routeParams:{[k:string]:string}      =   {};
    public routeData:{[k:string]:any}      =   {
        pageData : {
            state: ''
        }
    };

    public entitlements: AlEntitlementCollection | boolean = true;

    public events = new AlTriggerStream();

    public navigate = {
        byNamedRoute: (routeId: string, parameters?:{[p:string]:any}) => {
            // empty intentional
        },
        byRoute: () => {
            // empty intentional
        },
        byNgRoute: () => {
            // empty intentional
        },
        byLocation: () => {},

        byURL: () => {}
    };

    public router = {
        getCurrentNavigation: () => {
            return {
                extras: {
                    state: {}
                }
            };
        }
    };

    public setActiveEntitlements(...productIds: string[]) {
        this.entitlements = new AlEntitlementCollection(productIds.map((productId: string) => {
            return {
                productId: productId,
                active: true,
                expires: new Date(Date.now() + 86400000)
            };
        }));
    }

    public evaluateEntitlementExpression(expression: string): boolean {
        if (typeof (this.entitlements) === 'boolean') {
            return this.entitlements;
        }
        return this.entitlements.evaluateExpression(expression);
    }

    setRouteParameter(parameter: string, value: string) {
        // empty intentional
    }

    isExperienceAvailable( xpId:string ):boolean {
        return false;
    }

    getNavigationSchema(schemaId: string) {
        return Promise.resolve({});
    }

    public resolveURL( url:string|{locTypeId:string,path?:string}|AlRoute, parameters:{[p:string]:string} = {}, context?:AlLocationContext ):string {
        return '';
    }

    track() {}

    trackUsageEvent() {}


}
