import { HealthZeroStateComponent } from './health-zero-state.component';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AlNavigationService } from '@al/ng-navigation-components';
import { AlNavigationServiceMock } from '@al/ng-navigation-components/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { AlSession, AlActingAccountChangedEvent, AIMSAccount } from '@al/core';

describe('HealthZeroStateComponent', () => {
    let component: HealthZeroStateComponent;
    let fixture: ComponentFixture<HealthZeroStateComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
            declarations: [HealthZeroStateComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{
                provide: AlNavigationService,
                useClass: AlNavigationServiceMock
            }],
            imports: []
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HealthZeroStateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('SHOULD create component', () => {
        expect(component).toBeTruthy();
    });

    it('navigate to the open exposures route', () => {

        let actingAcount: AIMSAccount = {
            name: "Atlas SIEMless Test Accoun",
            id: "134278880",
            active: true,
            accessible_locations: [],
            default_location: "defender-us-ashbur",
            created: { at: 1564584736, by: "702DDB3B-BEE0-4565-93D6-D525034C9DFD" },
            modified: { at: 1564584746, by: "702DDB3B-BEE0-4565-93D6-D525034C9DFD" }
        };

        jest.spyOn(component.navigationService.navigate, "byNamedRoute");

        const ngZone = new NgZone({});
        ngZone.run(async () => {

            let event = new AlActingAccountChangedEvent(null, actingAcount);
            await AlSession.notifyStream.trigger(event);
            fixture.detectChanges();
            expect(component.navigationService.navigate.byNamedRoute).toHaveBeenCalledWith('exposures/open', { accountId: '2' });
        });

    });

    describe('WHEN navigateToDeploymentsPage() is called', () => {
        it('SHOULD redirect to phoenix deployment page with the accountId', () => {
            jest.spyOn(component.navigationService.navigate, "byNamedRoute");
            jest.spyOn(AlSession, 'getActingAccountId').mockImplementation(() => '2');
            component.navigateToDeploymentsPage();
            expect( component.navigationService.navigate.byNamedRoute ).toHaveBeenCalledWith('cd17:phoenix:deployments', {accountId: '2'});
        });
    });
});
