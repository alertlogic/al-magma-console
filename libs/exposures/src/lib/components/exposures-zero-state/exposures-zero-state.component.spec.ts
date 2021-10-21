import { TestBed, async, ComponentFixture, tick } from '@angular/core/testing';
import { AlNavigationService } from '@al/ng-navigation-components';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { AlSession, AlActingAccountChangedEvent, AIMSAccount } from '@al/core';
import { ExposuresZeroStateComponent } from './exposures-zero-state.component';
import { AlNavigationServiceMock } from '@al/ng-navigation-components/testing';

describe('ExposuresZeroStateComponent', () => {
    let component: ExposuresZeroStateComponent;
    let fixture: ComponentFixture<ExposuresZeroStateComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
            declarations: [ExposuresZeroStateComponent],
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
        fixture = TestBed.createComponent(ExposuresZeroStateComponent);
        component = fixture.componentInstance;
        jest.spyOn(AlSession, 'getActingAccountId').mockImplementation(() => '2');
        fixture.detectChanges();
    });

    describe('SHOULD create component', () => {
        it('navigate to the Open Exposures view', () => {

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

            expect(component).toBeTruthy();

        });
    });

    describe('WHEN navigateToDeploymentsPage() is called', () => {
        it('SHOULD redirect to phoenix deployment page with the accountId', () => {
            jest.spyOn(component.navigationService.navigate, "byNamedRoute");
            component.navigateToDeploymentsPage();
            expect(component.navigationService.navigate.byNamedRoute).toHaveBeenCalledWith('cd17:phoenix:deployments', { accountId: '2' });
        });
    });
});
