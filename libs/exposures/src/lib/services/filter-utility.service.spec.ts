import { RouterTestingModule } from '@angular/router/testing';
import { TestBed } from "@angular/core/testing";
import { FiltersUtilityService } from "./filters-utility.service";
import { HealthAssetDeployment, HealthAssetVPC, ExposureQueryResultItem, RemediationItemAsset, HealthAssetExposure } from "@al/assets-query";
import { AlNavigationServiceMock } from "@al/ng-navigation-components/testing";
import { AlNavigationService, AlUrlFilterService } from "@al/ng-navigation-components";
import { AlCardstackComponent } from '@al/ng-cardstack-components';
import { AlSession } from '@al/core';
import { AlDeploymentsClient, Deployment } from '@al/deployments';
import { AlPoliciesClient, Policy } from '@al/policies';
import { AlUiFilterValue } from '@al/ng-generic-components';
import { DummyCardstack, UrlFilterServiceMock } from '../../../testing';

const deploymentsList = require('../../../testing/mocks/deploymentsService/deployments-134282856.json') as Deployment[];
describe('FiltersUtilityService Test Suite', () => {
    let service: FiltersUtilityService;
    let alNavigationServiceMock: AlNavigationService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                FiltersUtilityService,
                { provide: AlNavigationService, useClass: AlNavigationServiceMock },
                { provide: AlUrlFilterService, useClass: UrlFilterServiceMock },
            ],
            imports: [RouterTestingModule]
        });
        service = TestBed.get(FiltersUtilityService);
        alNavigationServiceMock = TestBed.get(AlNavigationService);
    });

    describe('When adding filters to local storage', () => {
        it('should call set on the AlCabinet storage instance', () => {
            jest.spyOn(service.storage, 'set');
            const filters = ['some:filter'];
            service.addSelectedFiltersToStorage(filters, 'somePage', 'someState');
            expect(service.storage.set).toHaveBeenCalledWith('somePage-someState-filters', filters);
        });
    });

    describe('When retrieving filters from local storage', () => {
        it('should call get on the AlCabinet storage instance', () => {
            jest.spyOn(service.storage, 'get');
            service.getSelectedFiltersFromStorage('somePage', 'someState');
            expect(service.storage.get).toHaveBeenCalledWith('somePage-someState-filters', []);
        });
    });


    describe('When humanizing an array of string values', () => {
        it('should return a comma separated string with capitlised text', () => {
            expect(service.humanizeCategoriesList(['foo', 'bar'])).toEqual('Foo, Bar');
        });
    });



    describe('When generateCardstackHeaderConfig called', () => {
        it('should return Warning icon if state is Open', () => {
            service.activeStateFilter = service.stateFiltersInitial[0].value;
            let headerConfig = service.generateCardstackHeaderConfig();
            expect(headerConfig.iconConfig.name).toEqual('warning');
        });

        it('should return block icon if state is Disposed', () => {
            service.activeStateFilter = service.stateFiltersInitial[1].value;
            let headerConfig = service.generateCardstackHeaderConfig();
            expect(headerConfig.iconConfig.name).toEqual('block');
        });

        it('should return check icon if state is Concluded', () => {
            service.activeStateFilter = service.stateFiltersInitial[2].value;
            let headerConfig = service.generateCardstackHeaderConfig();
            expect(headerConfig.iconConfig.name).toEqual('check');
        });
    });


    describe('When navigateToNamedRoute called ', () => {

        it('should navigate to view', () => {
            jest.spyOn(AlSession, 'getActingAccountId').mockImplementation(() => '2');
            jest.spyOn(alNavigationServiceMock.navigate, 'byNgRoute');
            service.activeStateFilter = service.stateFiltersInitial[2].value;
            service.navigateToNamedRoute('exposures');
            expect(alNavigationServiceMock.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'exposures', 'concluded', '2'], { queryParams: {search: null} });

        });
    });


    describe('When onStateFilterChanged called', () => {
        let alCardstack: AlCardstackComponent = new AlCardstackComponent(alNavigationServiceMock);
        alCardstack.view = new DummyCardstack();

        it('should  navigate to remediation/exposures  view  if state is disposed/concluded', () => {
            jest.spyOn(AlSession, 'getActingAccountId').mockImplementation(() => '2');
            jest.spyOn(alNavigationServiceMock.navigate, 'byNgRoute');
            service['setDefaultViewByOption']('exposures');
            service.onStateFilterChanged(alCardstack, service.stateFiltersInitial[1].value, 'exposures');
            expect(alNavigationServiceMock.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'exposures', 'disposed', '2'], { queryParams: {search: null} });

        });

        it('should navigate to  selected view  if state is Open', () => {
            jest.spyOn(AlSession, 'getActingAccountId').mockImplementation(() => '2');
            jest.spyOn(alNavigationServiceMock.navigate, 'byNgRoute');
            service.onStateFilterChanged(alCardstack, service.stateFiltersInitial[0].value, 'exposures');
            expect(alNavigationServiceMock.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'exposures', 'open', '2'], { queryParams: {search: null} });


        });
    });


    it('should set deployments and extraAssetDetails when preLoadAdditonalAssetData()', async () => {
        const policy: Policy[] = [{
            id: "D12D5E67-166C-474F-87AA-6F86FC9FB9BC",
            name: "Professional",
            policy_rank: 4,
            product_family: "detect",
            udr_type: "professional_host",
            features: [{ type: "scan" }]
        }];
        jest.spyOn(AlSession, 'getActingAccountId').mockImplementation(() => '2');
        jest.spyOn(AlDeploymentsClient, 'listDeployments').mockImplementation(() => Promise.resolve(deploymentsList));
        jest.spyOn(AlPoliciesClient, 'listPolicies').mockImplementation(() => Promise.resolve(policy));
        const results = await service.preLoadAdditonalAssetData(true);

        expect(results).toEqual(deploymentsList);
        expect(service.extraAssetDetails['deployment:F4FA35AD-30DD-4755-B042-1E9CA972C830']).toEqual({ name: 'Default Datacenter Deployment', type: 'datacenter' });


    });


    it('should remove filter from array if unSelectFilter() called', async () => {
        let selectedFilters = ["deployment_id:7D5E66BE-98C6-40A2-8B09-5DC4C0FEE677", "category:configuration"];
        const latestSelectedFilter: AlUiFilterValue = {
            caption: "Configuration",
            count: 153,
            cssClasses: [],
            property: "category",
            value: "configuration",
            captionPlural: "Configuration",
            valueKey: "configuration"
        };


        expect(selectedFilters.length).toEqual(2);
        selectedFilters = (<string[]>service.unSelectFilter(selectedFilters, latestSelectedFilter.property,latestSelectedFilter.value));
        expect(selectedFilters.length).toEqual(1);

    });


    describe('When extractExposureDeploymentNames called ', () => {

        let exposures: ExposureQueryResultItem = {
            vulnerability_id: "37fb1e5ad065846a9105b286b78bfc49",
            remediations: [
                {
                    remediation_id: "verify_collector_configuration",
                    name: "Verify collector configuration and credentials collector is using.",

                }
            ],
            remediation_id: "verify_collector_configuration",
            name: "Collector reports an error communicating application API(offline).",
            deployment_ids: ["9A4A67CF-C2FC-404C-BFC8-FFE78DAC0154"],
        };

        let remediation: RemediationItemAsset = {
            remediation: {
                tags: {},
                deployment_id: "756C0413-D725-4B14-B3D3-C6348609B34E",
                name: "Alert Logic recommends that you add an Alert Logic appliance to this VNet.",
                remediation_id: "ids_missing_appliance_dc"
            }
        };
        it('should return ExposureDeploymentNames from extraAssetDetails', () => {
            service.extraAssetDetails = {
                "deployment_id:9A4A67CF-C2FC-404C-BFC8-FFE78DAC0154":
                    { name: "SIEMless reclaim test" }
            };

            let deploymentsNames: string[] = service.extractExposureDeploymentNames(exposures);
            expect(deploymentsNames[0]).toEqual('SIEMless reclaim test');
        });

        it('should return ExposureDeploymentNames from assetsList', () => {

            service.assetsList = {
                "deployment_id:9A4A67CF-C2FC-404C-BFC8-FFE78DAC0154":
                    { name: "SIEMless reclaim test 7" }
            };

            let deploymentsNames: string[] = service.extractExposureDeploymentNames(exposures);

            expect(deploymentsNames[0]).toEqual('SIEMless reclaim test 7');

        });

        it('should return ExposureDeploymentNames from RemediationItemAsset', () => {

            service.extraAssetDetails = {
                "deployment_id:756C0413-D725-4B14-B3D3-C6348609B34E": { name: "Matt Test ( DO NOT DELETE )" }
            };

            let deploymentsNames: string[] = service.extractExposureDeploymentNames(remediation);
            expect(deploymentsNames[0]).toEqual('Matt Test ( DO NOT DELETE )');

        });
    });
});
