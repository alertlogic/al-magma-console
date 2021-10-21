import {
    AlEntitlementCollection,
    AlLocation,
    AlLocatorService,
    AlNullRoutingHost,
    AlParamPreservationRule,
    AlRoute,
    AlRuntimeConfiguration, ConfigOption,
    AlSession,
    AlActingAccountResolvedEvent,
} from '@al/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
    inject,
    TestBed,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { setAuthState } from '../../testing';
import {
    AlExperiencePreferencesService,
    AlNavigationService
} from '../services';

describe('AlNavigationService', () => {

    beforeEach( () => {
        AlRuntimeConfiguration.setOption( ConfigOption.NavigationViaConduit, false );
        AlRuntimeConfiguration.setOption( ConfigOption.NavigationViaGestalt, false );
        AlRuntimeConfiguration.setOption( ConfigOption.NavigationAssetPath, `base/navigation-schemas` );
        TestBed.configureTestingModule( {
            imports: [ HttpClientTestingModule, RouterTestingModule ],
            providers: [
                {
                    provide: AlExperiencePreferencesService,
                    useValue: {
                        getExperiencePreferences: () => Promise.resolve( true )
                    }
                }
            ]
        } );
    } );

    afterEach( () => {
        AlRuntimeConfiguration.reset();
    } );

    describe( `.applyParameters()`, () => {
        it("should properly apply identity and route parameters to a given URL", inject( [ AlNavigationService ], async ( navigation:AlNavigationService ) => {

            await setAuthState( null );
            navigation.setRouteParameter("userId", "12345678" );
            navigation.setRouteParameter("thingyId", "thingy1" );

            /* Case 1: apply route parameters to route variables */
            let url = navigation.applyParameters("https://console.account.alertlogic.com/thingy/:userId/:thingyId", {} );
            expect( url ).toEqual( "https://console.account.alertlogic.com/thingy/12345678/thingy1" );

            /* Case 2: route parameters overridden by caller-provided values */
            url = navigation.applyParameters("https://console.account.alertlogic.com/thingy/:userId/:thingyId", { thingyId: 'thingy2' } );
            expect( url ).toEqual( "https://console.account.alertlogic.com/thingy/12345678/thingy2" );

            /* Case 3: authenticated state adds `aaid` and `locid` parameters as expected */
            await setAuthState( '2', '67108880' );
            url = navigation.applyParameters("https://console.account.alertlogic.com/thingy/:userId/:thingyId", { thingyId: 'unthing' } );
            expect( url ).toEqual( "https://console.account.alertlogic.com/thingy/12345678/unthing?aaid=67108880&locid=defender-us-denver" );

            /* Case 4: existing query string merge */
            //  query parameters should always be alphabetized
            url = navigation.applyParameters("https://console.account.alertlogic.com/thingy/:userId/:thingyId?beta=1&omega=z&zero=0", { thingyId: 'thingy2' } );
            expect( url ).toEqual( "https://console.account.alertlogic.com/thingy/12345678/thingy2?aaid=67108880&beta=1&locid=defender-us-denver&omega=z&zero=0" );

            /* Case 5: reference to undefined parameters/unused */
            url = navigation.applyParameters("https://console.account.alertlogic.com/thingy/:userId/:thingyId/:undefinedId", { thingyId: "thing1", unusedParam: "kevin" } );
            expect( url ).toEqual( "https://console.account.alertlogic.com/thingy/12345678/thing1/(null)?aaid=67108880&locid=defender-us-denver&unusedParam=kevin" );

            /* Case 6: override target aaid and locid parameters */
            url = navigation.applyParameters(   "https://console.account.alertlogic.com/thingy/:userId/:thingyId/:undefinedId",
                                                { thingyId: "thing1", unusedParam: "kevin" }, true, { as: { accountId: "10101010", locationId: "defender-uk-newport" } } );
            expect( url ).toEqual( "https://console.account.alertlogic.com/thingy/12345678/thing1/(null)?aaid=10101010&locid=defender-uk-newport&unusedParam=kevin" );

            /* Case 7: avoid double encoding */
            const queryExpression = "SOMETHING = SOMETHING && SOMETHING_ELSE IN ( A, B, C )";
            url = navigation.applyParameters("https://console.account.alertlogic.com/", { searchQuery: queryExpression } );
            url = navigation.applyParameters( url, { beta: "true" } );
            url = navigation.applyParameters( url, { zed: "zero" } );
            const expectedURL = `https://console.account.alertlogic.com/?aaid=67108880&beta=true&locid=defender-us-denver&searchQuery=${encodeURIComponent(queryExpression)}&zed=zero`;
            expect( url ).toEqual( expectedURL );

        } ) );
    } );

    describe( `.resolveURL()`, () => {
        beforeEach( () => {
            AlLocatorService.setContext( { environment: 'development' } );
        } );
        it("should properly form URLs from literal strings", inject( [ AlNavigationService ], async (navigation:AlNavigationService ) => {

            navigation.setRouteParameter("userId", "12345678" );
            navigation.setRouteParameter("thingyId", "thingy1" );
            await setAuthState( "2", "67108880");
            let url = navigation.resolveURL( "https://console.account.alertlogic.com/thingy/:userId/:thingyId" );

            expect( url ).toEqual( "https://console.account.alertlogic.com/thingy/12345678/thingy1?aaid=67108880&locid=defender-us-denver" );
        } ) );

        it("should properly form URLs from AlRoute objects", inject( [ AlNavigationService ], async (navigation:AlNavigationService ) => {
            navigation.setRouteParameter("userId", "12345678" );
            navigation.setRouteParameter("thingyId", "thingy1" );
            await setAuthState( "2", "67108880");
            let route = AlRoute.link( AlNullRoutingHost, AlLocation.AccountsUI, '/thingy/:userId/:thingyId' );
            let url = navigation.resolveURL( route );
            expect( url ).toEqual( "http://localhost:8002/thingy/12345678/thingy1?aaid=67108880&locid=defender-us-denver" );
        } ) );

        it("should properly form URLs from locTypeId/path pairs", inject( [ AlNavigationService ], async (navigation:AlNavigationService ) => {
            navigation.setRouteParameter("userId", "12345678" );
            navigation.setRouteParameter("thingyId", "thingy1" );
            await setAuthState( "2", "67108880");
            let url = navigation.resolveURL( { locTypeId: AlLocation.AccountsUI, path: '/thingy/:userId/:thingyId' } );
            expect( url ).toEqual( "http://localhost:8002/thingy/12345678/thingy1?aaid=67108880&locid=defender-us-denver" );
        } ) );

    } );

    describe( `.navigate`, () => {
        let navigation:any;   //  just easier in this context
        beforeEach( () => {
            inject( [ AlNavigationService ], ( injected:AlNavigationService ) => {
                navigation = injected;
                jest.spyOn( navigation, "getNavigationSchema" ).mockReturnValue( {} );
                navigation.navigationReady.resolve( true );
            } )();
        } );
        describe( `byNamedRoute()`, () => {
            it("should work", done => {
                const fakeRoute = {
                    caption: "Fake",
                    action: {
                        "type": "link",
                        "location": "cd17:accounts",
                        "path": "/#/aims/users"
                    }
                };
                jest.spyOn( navigation, "getRouteByName" ).mockReturnValue( fakeRoute );
                const spy = jest.spyOn( navigation, "navigateByRoute" ).mockReturnValue( true );
                jest.setTimeout(10000);
                navigation.navigate.byNamedRoute( "fake_route_id", { fakeParam: "truthy" } );
                setTimeout( () => {
                    expect( navigation.navigateByRoute ).toHaveBeenCalled();
                    //expect( spy.mock.instances[0] ).('foo')
                    let args = spy.mock.calls[0] as any[];
                    expect( args[0].definition ).toEqual( fakeRoute );
                    expect( args[1].fakeParam ).toEqual( "truthy" );
                    done();
                }, 10 );
            } );
        } );
        describe( `byRoute()`, () => {
            beforeEach( () => {
                AlLocatorService.setContext( { environment: 'development' } );
                navigation.currentUrl = `http://localhost:4220/#/search/expert/2?aaid=2&locid=defender-us-denver`;
                AlLocatorService.setActingUrl( navigation.currentUrl );
            } );
            it("should work with a location/path route", () => {
                jest.spyOn( navigation, "navigateByURL" ).mockReturnValue( true );
                jest.spyOn( navigation, "navigateByLocation" );
                let route = AlRoute.link( navigation, "cd17:accounts", "/#/aims/users" );
                navigation.navigate.byRoute( route, { fakeParam: "true" } );
                expect( navigation.navigateByLocation ).toHaveBeenCalledWith( "cd17:accounts", "/#/aims/users", { fakeParam: "true" }, {} );
                expect( navigation.navigateByURL ).toHaveBeenCalledWith( "http://localhost:8002/#/aims/users", { fakeParam: "true" }, {} );
            } );
            it("should work with a url route", () => {
                jest.spyOn( navigation, "navigateByURL" ).mockReturnValue( true );
                jest.spyOn( navigation, "navigateByLocation" ).mockReturnValue( true );
                let routeDefinition = {
                    "caption": "Test",
                    "action": {
                        "type": "link",
                        "url": "https://www.google.com"
                    }
                };
                let route = new AlRoute( navigation, routeDefinition );
                navigation.navigate.byRoute( route, { fakeParam: "true" } );
                expect( navigation.navigateByURL ).toHaveBeenCalled();
                expect( navigation.navigateByURL ).toHaveBeenCalledWith( "https://www.google.com", { "fakeParam": "true" }, {} );
            } );
        } );
        describe( `byLocation`, () => {
            beforeEach( () => {
                AlLocatorService.setContext( { environment: 'development' } );
            } );
            it( "should work", () => {
                jest.spyOn( navigation, "navigateByURL" ).mockReturnValue( true );
                navigation.navigate.byLocation( "cd17:accounts", "/#/aims/users", { "fakeParam": "true" } );
                expect( navigation.navigateByURL ).toHaveBeenCalledWith( "http://localhost:8002/#/aims/users", { fakeParam: "true" }, {} );
            } );
        } );
        describe( `byURL`, () => {
            it( "should work", async () => {
                await setAuthState( null );
                const spy = jest.spyOn( navigation, "goToURL" ).mockReturnValue( true );
                navigation.navigate.byURL( "https://console.account.alertlogic.com/#/aims/users", { fakeParam: "true" } );
                expect( navigation.goToURL ).toHaveBeenCalledWith( "https://console.account.alertlogic.com/#/aims/users?fakeParam=true", {} );
                spy.mockClear();
                navigation.navigate.byURL( "https://console.account.alertlogic.com/#/aims/users", { fakeParam: "false" }, { "target": "_blank" } );
                expect( navigation.goToURL ).toHaveBeenCalledWith( "https://console.account.alertlogic.com/#/aims/users?fakeParam=false", { "target": "_blank" } );
                await setAuthState( '2', '67108880' );
                spy.mockClear();
                navigation.navigate.byURL( "https://console.account.alertlogic.com/#/aims/users", { fakeParam: "false" }, { "target": "_blank" } );
                expect( navigation.goToURL ).toHaveBeenCalledWith( "https://console.account.alertlogic.com/#/aims/users?aaid=67108880&fakeParam=false&locid=defender-us-denver", { target: "_blank" } );
                spy.mockClear();
                navigation.navigate.byURL( "https://console.account.alertlogic.com/#/aims/users", { fakeParam: "false" }, { "target": "_blank", as: { accountId: "10101010", locationId: "defender-uk-newport" } } );
                expect( navigation.goToURL )
                        .toHaveBeenCalledWith( "https://console.account.alertlogic.com/#/aims/users?aaid=10101010&fakeParam=false&locid=defender-uk-newport",
                                                { target: "_blank", as: { accountId: "10101010", locationId: "defender-uk-newport" } } );
            } );
        } );
        describe( `byNgRoute`, () => {
            it("should work", async () => {
                await setAuthState( null );
                const spy = jest.spyOn( navigation.router, "navigate" ).mockReturnValue( true );
                jest.spyOn( navigation.navigate, "byNgRoute" );

                navigation.navigate.byNgRoute( [ 'kevin', 'was', 'here' ] );
                expect( navigation.router.navigate ).toHaveBeenCalledWith( [ 'kevin', 'was', 'here' ], { queryParamsHandling: "merge", skipLocationChange: false, queryParams: { aims_token: undefined } } );

                //navigation.router.navigate.calls.reset();
                spy.mockClear();

                await setAuthState( "2", "67108880" );
                navigation.navigate.byNgRoute( [ 'kevin', 'was', 'here' ] );
                expect( navigation.router.navigate ).toHaveBeenCalledWith( [ 'kevin', 'was', 'here' ],
                                                                           { queryParamsHandling: "merge", skipLocationChange: false, queryParams: { aaid: "67108880", locid: "defender-us-denver", aims_token: undefined } } );
                navigation.navigate.to( "kevin/was/here", { fakeParam: "true" } );
                expect( navigation.router.navigate ).toHaveBeenCalledWith( [ 'kevin/was/here' ], { queryParamsHandling: "merge", queryParams: { aaid: "67108880", locid: "defender-us-denver", fakeParam: "true", aims_token: undefined } } );
            } );
        } );
        describe( `byNgRoute with parameter preservation zones`, () => {
            it("should work", async () => {
                await setAuthState( "2", "67108880" );
                const spy = jest.spyOn( navigation.router, "navigate" ).mockReturnValue( true );

                AlRuntimeConfiguration.addParamPreservationRule( `zone1`, {
                    applyTo: [ /\/zone1.*/ ],
                    volatile: [ "step" ],
                    whitelist: [ "category", "search" ]
                } );
                AlRuntimeConfiguration.addParamPreservationRule( `zone2`, {
                    applyTo: [ /\/zone2.*/ ],
                    volatile: [ "step" ],
                    whitelist: [ "search" ]
                } );

                navigation.navigate.byNgRoute( [ 'zone1', 'subpath', 'something' ] );
                navigation['queryParams']['step'] = "start";
                navigation['queryParams']['category'] = "main";
                navigation['queryParams']['search'] = "knielsen";

                spy.mockClear();

                navigation.navigate.byNgRoute( [ 'zone2', 'subpath', 'something-else' ] );
                expect( navigation.router.navigate ).toHaveBeenCalledWith( [ 'zone2', 'subpath', 'something-else' ],
                    {
                        queryParamsHandling: "merge",
                        skipLocationChange: false,
                        queryParams: {
                            aaid: "67108880",
                            locid: "defender-us-denver",
                            aims_token: undefined,
                            step: undefined,
                            category: undefined
                        }
                    } );
            } );
        } );
    } );

    describe( `getters and setters`, () => {
        it("should get/set the appropriate data", inject( [ AlNavigationService ], async ( navigation:AlNavigationService ) => {
            //  These are just simple tautological tests, for the most part...  booooooring
            expect( navigation.getExperience() ).toEqual( navigation['experience'] );
            expect( navigation.getSchema() ).toEqual( navigation['navigationSchemaId'] );

            navigation.setForceExperience( true );
            expect( navigation.getForcedExperience() ).toEqual( navigation['forcedExperience'] );
            navigation.setForceSchema( true );
            expect( navigation.getForcedSchema() ).toEqual( navigation['forcedSchema'] );

            navigation.setForceExperience( false );
            navigation.setForceSchema( false );

            const s = jest.spyOn( navigation['frameNotifier'], 'again' );
            navigation.setExperience( "beta" );
            expect( navigation.getExperience() ).toEqual( "beta" );
            expect( navigation.routeParameters.experience ).toEqual( "beta" );
            expect( navigation['frameNotifier']['again'] ).toHaveBeenCalled();
            s.mockClear();
            //navigation['frameNotifier']['again']['calls'].reset();

            navigation.setSchema( "siemless" );
            expect( navigation.getSchema() ).toEqual( "siemless" );
            expect( navigation['frameNotifier']['again'] ).toHaveBeenCalled();

            //navigation['frameNotifier']['again']['calls'].reset();
            s.mockClear();
        } ) );
    } );

    // describe( `setActingAccount()`, () => {
    //     it("should work", inject( [ AlNavigationService ], async ( navigation:AlNavigationService ) => {
    //         jest.spyOn( AlSession, 'setActingAccount' ).mockReturnValue( Promise.resolve( {} as AlActingAccountResolvedEvent ) );
    //         await setAuthState( "2", "2" );
    //         await navigation.setActingAccount( "67108880" );
    //     } ) );
    // } );

    describe( `rewriteUrlToAccountAndLocation()`, () => {

        afterEach( () => {
            AlLocatorService.setContext( { environment: 'development', residency: 'US' } );
        } );
        it("should work without trashing CID 2 URLs", inject( [ AlNavigationService ], async ( navigation:AlNavigationService ) => {
            await setAuthState( "2", "23456" );

            let rewritten = navigation.rewriteUrlToAccountAndLocation( "https://console.search.alertlogic.com/#/search/23456/expert?aaid=23456&locid=defender-us-denver", "2", "defender-us-denver" );
            expect( rewritten ).toEqual( "https://console.search.alertlogic.com/#/search/23456/expert?aaid=23456&locid=defender-us-denver" );

            rewritten = navigation.rewriteUrlToAccountAndLocation( "https://console.search.alertlogic.com/#/search/2/expert?aaid=2&locid=defender-us-denver", "2", "defender-us-denver" );
            expect( rewritten ).toEqual( "https://console.search.alertlogic.com/#/search/23456/expert?aaid=23456&locid=defender-us-denver" );

        } ) );
        it("should work when changing residencies", inject( [ AlNavigationService ], async ( navigation:AlNavigationService ) => {
            let aNav = navigation as any;       //  ha ha ha :|
            navigation.currentUrl = 'https://console.account.alertlogic.com/#/manage-notifications/2/alerts?aaid=2&locid=defender-us-ashburn';
            jest.spyOn( aNav, "goToURL" ).mockImplementation( ( url ) => {
                console.log(`Navigation says to go to '${url}'` );
                return true;
            } );

            //  Set initial context to Production/US
            AlLocatorService.setActingUrl( navigation.currentUrl );
            await setAuthState( "2", "2" );

            jest.spyOn( AlSession, 'setActingAccount' ).mockImplementation( () => {
                AlLocatorService.setContext( { environment: 'production', residency: "EMEA" } );
                AlSession.setActiveDatacenter("defender-uk-newport" );
                ( AlSession as any ).sessionData.acting.id = "67108880";
                return Promise.resolve( {} as AlActingAccountResolvedEvent );
            } );

            await navigation.setActingAccount( "67108880" );

            expect( aNav.goToURL ).toHaveBeenCalled();
            // let args = aNav.goToURL.calls[0][0];
            expect( aNav.goToURL ).lastCalledWith( 'https://console.account.alertlogic.co.uk/#/manage-notifications/67108880/alerts?aaid=67108880&locid=defender-uk-newport' );
        } ) );
    } );

    describe( `Experience Mappings`, () => {
        let navigation:AlNavigationService;
        beforeEach( async () => {
            inject( [ AlNavigationService ], ( injected:AlNavigationService ) => {
                navigation = injected;
            } )();
            await setAuthState( "2", "67108880" );
            await navigation.ready();
        } );

        it( "should calculate experience availability based on fixed conditions", async () => {
            const mockExperienceMappings = {
                "mock": {
                    "variantA": {
                        name: "Variant A - Always Enabled",
                        trigger: true
                    },
                    "variantB": {
                        name: "Variant B - Never Enabled",
                        trigger: false
                    },
                    "variantC": {
                        name: "Variant C - Enabled for accounts 2 and 67108880",
                        trigger: {
                            accounts: [ "2", "67108880" ]
                        }
                    },
                    "variantD": {
                        name: "Variant D - Disabled for non-existent accounts",
                        trigger: {
                            accounts: [ "3", "4", "5" ]
                        }
                    },
                    "variantE": {
                        name: "Variant E - Enabled based on current environment",
                        trigger: {
                            environments: [ AlLocatorService.getCurrentEnvironment() ]
                        }
                    },
                    "variantF": {
                        name: "Variant F - Disabled because of non-existent environment",
                        trigger: {
                            environments: [ "fake-environment" ]
                        }
                    },
                    "variantG": {
                        name: "Variant G - Enabled because of time range",
                        trigger: {
                            after: "2020-07-08T14:47:49+0000",
                            before: "2030-01-01T00:00:00+0000"
                        }
                    },
                    "variantH": {
                        name: "Variant H - Disabled because of time range",
                        trigger: {
                            after: "2019-01-01T14:47:49+0000",
                            before: "2020-01-01T00:00:00+0000"
                        }
                    },
                    "variantI": {
                        name: "Variant I - Enabled based on primary and acting entitlements, with multiple triggers",
                        trigger: [
                            {
                                "entitlements": "A&B&C|D"
                            },
                            {
                                "primaryEntitlements": "A&B&C|D",
                                "entitlements": "E"
                            }
                        ]
                    }
                }
            };
            navigation.entitlements = AlEntitlementCollection.fromArray( [ 'E', 'F' ] );
            navigation.primaryEntitlements = AlEntitlementCollection.fromArray( [ 'A', 'B', 'C', 'Z' ] );
            navigation['evaluateExperienceMappings']( mockExperienceMappings );

            expect( navigation.isExperienceAvailable( 'mock#variantA' ) ).toEqual( true );      //  statically enabled (boolean true)
            expect( navigation.isExperienceAvailable( 'mock#variantB' ) ).toEqual( false );     //  statically disabled (boolean false)
            expect( navigation.isExperienceAvailable( 'mock#variantC' ) ).toEqual( true );      //  conditionally enabled (account ID)
            expect( navigation.isExperienceAvailable( 'mock#variantD' ) ).toEqual( false );     //  conditionally disabled (account ID)
            expect( navigation.isExperienceAvailable( 'mock#variantE' ) ).toEqual( true );      //  conditionally enabled (environment)
            expect( navigation.isExperienceAvailable( 'mock#variantF' ) ).toEqual( false );     //  conditionally disabled (environment)
            expect( navigation.isExperienceAvailable( 'mock#variantG' ) ).toEqual( true );      //  conditionally enabled (time)
            expect( navigation.isExperienceAvailable( 'mock#variantH' ) ).toEqual( false );     //  conditionally disabled (time)
            expect( navigation.isExperienceAvailable( 'mock#variantI' ) ).toEqual( true );      //  conditionally enabled (compound conditions based on entitlements)

            navigation.primaryEntitlements = AlEntitlementCollection.fromArray( [ 'G', 'H', 'I' ] );
            navigation['evaluateExperienceMappings']( mockExperienceMappings );

            expect( navigation.isExperienceAvailable( 'mock#variantI' ) ).toEqual( false );     //  conditionally disabled (compound conditions based on entitlements)
        } );
    } );
});
