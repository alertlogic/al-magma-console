
import { TestBed } from '@angular/core/testing';
import { FilterDefinitionsService } from '../services/filter-definitions.service';
import { FiltersUtilityService } from '../services/filters-utility.service';
import { FilterUtilityServiceMock } from '../../../testing/filter-utility-service-mock';
import { RouterTestingModule } from '@angular/router/testing';
import { AlNavigationService, AlUrlFilterService } from '@al/ng-navigation-components';
import { AlNavigationServiceMock } from '@al/ng-navigation-components/testing';
import { UrlFilterServiceMock } from '../../../testing/url-filter.service-mock';
import { AlAssetsQueryClient, ExposureQueryResultItem, ExposuresQueryResponse, RemediationItemsQueryResponse } from '@al/assets-query';
import { AlSession, AlCardstackCharacteristics, AIMSClient } from '@al/core';
import { ExposuresCardstackView } from './exposures.cardstack';
import { AppInjector } from '@al/ng-generic-components';
const injectorMock = {
    get(token: any) {
        return TestBed.inject(token);
    }
};

const getQueryExposures = require('../../../testing/mocks/al-assets-query-client/query-exposures.json') as ExposuresQueryResponse;
const queryRemediationItems = require('../../../testing/mocks/al-assets-query-client/query-remediation-items.json') as RemediationItemsQueryResponse;
const mockCharacteristics = require('../../../testing/mocks/al-cardstack-characteristics.json') as AlCardstackCharacteristics;
const getUserDetailsByUserId = require('../../../testing/mocks/aims/user-detail-by-user-id.json');

describe('ExposuresCardstackView', () => {
    let exposuresCardstackView: ExposuresCardstackView;
    let filterUtilityService: FiltersUtilityService;
    beforeEach(async () => {
        AppInjector.setInjector(injectorMock);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                FilterDefinitionsService,
                { provide: FiltersUtilityService, userClass: FilterUtilityServiceMock },
                { provide: AlUrlFilterService, useClass: UrlFilterServiceMock },
                { provide: AlNavigationService, useClass: AlNavigationServiceMock }
            ]
        });
        filterUtilityService = TestBed.get(FiltersUtilityService);
        filterUtilityService.assetsList = {
            "deployment_id:9A4A67CF-C2FC-404C-BFC8-FFE78DAC0154":
                { name: "SIEMless reclaim test 7" }
        };
        exposuresCardstackView = new ExposuresCardstackView(filterUtilityService, TestBed.get(FilterDefinitionsService));
        exposuresCardstackView.characteristics = mockCharacteristics;
        jest.spyOn(AlSession, 'getActingAccountId').mockReturnValue('10000');
        jest.spyOn(filterUtilityService, "extractExposureDeploymentNames").mockImplementation(() => []);
    });

    it('it should create service', () => {
        expect(exposuresCardstackView).toBeTruthy();
    });

    it('it should call generateCharacteristics()', () => {
        exposuresCardstackView.generateCharacteristics();
        expect(exposuresCardstackView.characteristics.localPagination).toBeTruthy();

    });


    it('it should call deriveEntityProperties ', () => {
        let remediations: ExposureQueryResultItem = {
            "vulnerability_id": "37fb1e5ad065846a9105b286b78bfc49",
            "vinstances_count": 18,
            "severity": "high",
            "remediations": [
                {
                    "remediation_id": "verify_collector_configuration",
                    "name": "Verify collector configuration and credentials collector is using.",

                }
            ],
            "remediation_id": "verify_collector_configuration",
            "name": "Collector reports an error communicating application API(offline).",
            "deployment_ids": ["9A4A67CF-C2FC-404C-BFC8-FFE78DAC0154"],
            "cvss_score": 10.0,
            "categories": [
                "configuration"
            ]
        };

        let derivedProps = exposuresCardstackView.deriveEntityProperties(remediations);
        expect(derivedProps.id).toEqual(remediations.vulnerability_id);
        expect(derivedProps.icon.cssClasses).toEqual('al al-risk-1 risk critical');

        let exposures = {
            "audit_id": "5fe231de3e31ac7064df974341cb6efc",
            "exposures": [
                {
                    "name": "Network Without Alert Logic Appliance",
                    "remediation_id": "ids_missing_appliance_dc",
                    "severity": "low",
                    "cvss_score": 10,
                    "vinstances_count": 2,
                    "categories": ["configuration"],
                    "vulnerability_id": "37fb1e5ad065846a9105b286b78bfc49"
                }
            ],
            "vulnerability_id": "37fb1e5ad065846a9105b286b78bfc49",
            "deployment_id": "34B66677-EEF9-4F74-8A9C-FFE24EC1A653",
            "reason": "acceptable_risk",
            "type": "remediation-item"
        };

        derivedProps = exposuresCardstackView.deriveEntityProperties(exposures);
        expect(derivedProps.id).toEqual('5fe231de3e31ac7064df974341cb6efc/37fb1e5ad065846a9105b286b78bfc49');
    });


    it('it should call fetchData() for UnHealthy state', () => {
        jest.spyOn(AlAssetsQueryClient, 'queryExposures').mockReturnValue(Promise.resolve(getQueryExposures));
        exposuresCardstackView.fetchData(false, [{ "rawValues": ['agent'] }]);

        expect(exposuresCardstackView.remainingPages).toEqual(1);
    });

    it('it should call fetchData() for Disposed/Conclude state', async() => {
        filterUtilityService.activeStateFilter.label = 'Disposed';
        jest.spyOn(AlAssetsQueryClient, 'queryRemediationItems').mockReturnValue(Promise.resolve(queryRemediationItems));
        jest.spyOn(AIMSClient, "getUserDetailsByUserId").mockReturnValue(Promise.resolve(getUserDetailsByUserId));
        await exposuresCardstackView.fetchData(false, [{ "rawValues": ['agent'] }]);

    });

    it('it should clear the filter if no record found with given filters', () => {
        filterUtilityService.activeStateFilter.label = 'Disposed';
        const remoteFilter = [{ "rawValues": ['agent'] }];
        queryRemediationItems['remediation-items'].assets = [];

        jest.spyOn(AlAssetsQueryClient, 'queryRemediationItems').mockReturnValue(Promise.resolve(queryRemediationItems));

        const result: Promise<any[]> = exposuresCardstackView.fetchData(false, remoteFilter);
        result.then(res => {
            expect(res).toEqual([]);
        });

    });



});
