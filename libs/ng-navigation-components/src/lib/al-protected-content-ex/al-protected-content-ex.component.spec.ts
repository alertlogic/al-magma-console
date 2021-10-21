import {
    AlRoute,
    AlSession,
    AlLocatorService,
    AlRuntimeConfiguration, ConfigOption
} from '@al/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
    CUSTOM_ELEMENTS_SCHEMA,
    SimpleChange,
} from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import {
    createEntitlementSet,
    setAuthState,
    timeoutPromise,
} from '../../testing';
import { AlExperiencePreferencesService } from '../services/al-experience-preferences.service';
import { ExperiencePreference } from '../types';
import { AlNavigationService } from '../services/al-navigation.service';

import { AlProtectedContentExComponent } from './al-protected-content-ex.component';

describe('AlProtectedContentExComponent', () => {
    let component: AlProtectedContentExComponent;
    let fixture: ComponentFixture<AlProtectedContentExComponent>;
    let navigation: any;    //  just easier

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ AlProtectedContentExComponent ],
            providers: [
                AlExperiencePreferencesService,
                AlNavigationService
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            imports: [ RouterTestingModule, HttpClientTestingModule ]
        }).compileComponents();
    }));

    beforeEach(() => {
        inject( [ AlNavigationService ], ( injected:any ) => {
            navigation = injected;
            AlRuntimeConfiguration.setOption( ConfigOption.NavigationViaConduit, false );
            navigation.navigationReady.resolve( true );
        } )();
        fixture = TestBed.createComponent(AlProtectedContentExComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach( () => {
        AlRuntimeConfiguration.reset();
    } );

    it('should initialize with the expected defaults', async () => {
        jest.spyOn( component, 'evaluateAccessibility' ).mockReturnValue( Promise.resolve( false ) );
        component.ngOnChanges( {
            experiences: new SimpleChange( undefined, null, true ),
            environments: new SimpleChange( undefined, null, true ),
            entitlements: new SimpleChange( undefined, null, true ),
            primaryEntitlements: new SimpleChange( undefined, null, true ),
            authentication: new SimpleChange( undefined, null, true ),
            query: new SimpleChange( undefined, null, true )
        } );
        expect( component['evaluateAccessibility'] ).toHaveBeenCalled();
        expect( component['conditions']['entitlements'] ).toEqual( null );
        expect( component['conditions']['primaryEntitlements'] ).toEqual( null );
        expect( component['conditions']['experiences'] ).toEqual( null );
        expect( component['conditions']['environments'] ).toEqual( null );
        expect( component['conditions']['authentication'] ).toEqual( null );
    } );

    it('should normalize inputs as expected', async () => {
        component.experiences = "default";
        component.authentication = true;
        component.entitlements = "kevin";
        component.primaryEntitlements = [ "kevin", "kevin2" ];
        component.environments = [ "development", "integration", "production" ];

        jest.spyOn( component, 'evaluateAccessibility' ).mockReturnValue( Promise.resolve( false ) );

        component.ngOnChanges( {
            experiences: new SimpleChange( undefined, component.experiences, true ),
            environments: new SimpleChange( undefined, component.environments, true ),
            entitlements: new SimpleChange( undefined, component.entitlements, true ),
            primaryEntitlements: new SimpleChange( undefined, component.primaryEntitlements, true ),
            authentication: new SimpleChange( undefined, component.authentication, true ),
        } );

        expect( component['evaluateAccessibility'] ).toHaveBeenCalled();
        expect( component['conditions']['entitlements'] ).toEqual( [ "kevin" ] );
        expect( component['conditions']['primaryEntitlements'] ).toEqual( [ "kevin", "kevin2" ] );
        expect( component['conditions']['experiences'] ).toEqual( [ "default" ] );
        expect( component['conditions']['environments'] ).toEqual( [ "development", "integration", "production" ] );
        expect( component['conditions']['authentication'] ).toEqual( true );
    });

    it('should support redirection in any form', async () => {
        const spyGoToURL = jest.spyOn( navigation, "goToURL" ).mockReturnValue( true );
        const spy = jest.spyOn( navigation, "navigateByNgRoute" ).mockReturnValue( true );

        await setAuthState( null );

        //  ng routes
        component.redirect( [ "something", "else" ] );
        expect( spy.mock.calls[0][0] ).toEqual( [ "something", "else" ] );

        component.redirect( "https://www.google.com/something/else", { parameter: "yehaw" } );
        expect( navigation.goToURL ).toHaveBeenCalledWith( "https://www.google.com/something/else?parameter=yehaw", {} );

        spyGoToURL.mockClear();

        component.redirect( { location: "cd17:accounts", path: "/#/aims/users" }, { something: "2" } );
        expect( navigation.goToURL ).toHaveBeenCalledWith( "http://localhost:8002/#/aims/users?something=2", {} );

        spyGoToURL.mockClear();

        navigation.currentUrl = 'http://localhost:4220/#/search/expert/2';
        AlLocatorService.setActingUrl( navigation.currentUrl );
        let route = AlRoute.link( navigation, "cd17:accounts", "/#/aims/users" );
        component.redirect( route, { something: "3" } );
        expect( navigation.goToURL ).toHaveBeenCalledWith( "http://localhost:8002/#/aims/users?something=3", {} );
    } );

    describe("evaluateAccessibility()", () => {
        it("should protect authenticated content in an unauthenticated context", async () => {
            await setAuthState( null );
            component.ngOnChanges( {
                authentication: new SimpleChange( undefined, true, true )
            } );
            await timeoutPromise( 10 );
            await component['calculatingState'];
            expect( component.contentVisible ).toEqual( false );
        } );
        it("should protect entitlement-based content in an unauthenticated context", async () => {
            await setAuthState( null );
            component.ngOnChanges( {
                entitlements: new SimpleChange( undefined, [ "test_entitlement" ], true )
            } );
            await timeoutPromise( 10 );
            await component['calculatingState'];
            expect( component.contentVisible ).toEqual( false );
        } );
        it("should protect entitlement-based content", async () => {
            await setAuthState( '2', '2' );
            jest.spyOn( AlSession, 'getEffectiveEntitlements' ).mockReturnValue( Promise.resolve( createEntitlementSet( [ "fake_entitlement1", "fake_entitlement2" ] ) ) );
            component.ngOnChanges( {
                entitlements: new SimpleChange( undefined, [ "test_entitlement" ], true )
            } );
            await timeoutPromise( 10 );
            await component['calculatingState'];
            expect( component.contentVisible ).toEqual( false );
        } );
        it("should protect primary-entitlement-based content", async () => {
            await setAuthState( '2', '2' );
            jest.spyOn( AlSession, 'getPrimaryEntitlements' ).mockReturnValue( Promise.resolve( createEntitlementSet( [ "fake_entitlement1", "fake_entitlement2" ] ) ) );
            component.ngOnChanges( {
                primaryEntitlements: new SimpleChange( undefined, [ "test_entitlement" ], true )
            } );
            await timeoutPromise( 10 );
            await component['calculatingState'];
            expect( component.contentVisible ).toEqual( false );
        } );
        it("should protect environment-based content", async () => {
            component.ngOnChanges( {
                environments: new SimpleChange( undefined, [ "beta-navigation" ], true )
            } );
            await timeoutPromise( 10 );
            await component['calculatingState'];
            expect( component.contentVisible ).toEqual( false );
        } );
        it("should protect experience-based content", async () => {
            jest.spyOn( component.experiencePreferences, "getExperiencePreferences" ).mockReturnValue( Promise.resolve( {} as ExperiencePreference ) );
            jest.spyOn( component.navigation, "getExperience" ).mockReturnValue( "beta" );
            component.ngOnChanges( {
                experiences: new SimpleChange( undefined, [ "default" ], true )
            } );
            await timeoutPromise( 10 );
            await component['calculatingState'];
            expect( component.contentVisible ).toEqual( false );
        } );
    } );
});
