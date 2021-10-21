import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { inject, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AlRuntimeConfiguration, ConfigOption } from '@al/core';
import { AlNavigationFrameComponent } from './al-navigation-frame.component';
import { AlNavigationService, AlExperiencePreferencesService } from '../services';

// import { setAuthState, timeoutPromise, createEntitlementSet } from '../../../testing/src/lib';

describe('AlNavigationFrameComponent', () => {
    let component: AlNavigationFrameComponent;
    let fixture: ComponentFixture<AlNavigationFrameComponent>;
    let navigation:any;

    beforeEach(waitForAsync(() => {
        AlRuntimeConfiguration.setOption( ConfigOption.NavigationViaConduit, false );
        TestBed.configureTestingModule({
            declarations: [ AlNavigationFrameComponent ],
            providers: [
                AlNavigationService,
                AlExperiencePreferencesService
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            imports: [ RouterTestingModule, HttpClientTestingModule ]
        }).compileComponents();
    }));

    beforeEach(() => {
        inject( [ AlNavigationService ], ( injected:any ) => {
            navigation = injected;
            navigation.navigationReady.resolve( true );
        } );
        fixture = TestBed.createComponent(AlNavigationFrameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach( () => {
        AlRuntimeConfiguration.reset();
    } );

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
