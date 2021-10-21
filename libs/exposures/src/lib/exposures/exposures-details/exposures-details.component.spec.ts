import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExposuresDetailsComponent } from './exposures-details.component';
import { FiltersUtilityService, FilterDefinitionsService, ErrorService } from '../../services';
import { AlNavigationService, AlUrlFilterService } from '@al/ng-navigation-components';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { AlNavigationServiceMock } from '@al/ng-navigation-components/testing';
import { UrlFilterServiceMock } from '../../../../testing/url-filter.service-mock';
import { AlDeploymentsClient, Deployment } from '@al/deployments';
import { AlVulnerabilitiesClient, Vulnerability } from '@al/vulnerabilities';
import { AlAssetsQueryClient, ExposuresQueryResponse, RemediationItemsQueryResponse } from '@al/assets-query';
import { AppConstants } from '../../constants';
import { AppInjector } from '@al/ng-generic-components';

const getVulnerabilityMockResponse: Vulnerability = require('../../../../testing/mocks/al-vulnerabilities-client/getVulnerability.json');
const queryExposureMockResponse: ExposuresQueryResponse = require("../../../../testing/mocks/al-assets-query-client/query-exposures.json");
const queryRemediationItemsMockResponse: RemediationItemsQueryResponse = require("../../../../testing/mocks/al-assets-query-client/query-remediation-items.json");
const getDeploymentList = require('../../../../testing/mocks/deploymentsService/deployments-134282856.json') as Deployment[];


const injectorMock = {
    get(token: any) {
        return TestBed.inject(token);
    }
};

describe('ExposuresDetailsComponent', () => {
    let component: ExposuresDetailsComponent;
    let fixture: ComponentFixture<ExposuresDetailsComponent>;
    let alNavigationMockService: AlNavigationService;
    let filtersUtilityService: FiltersUtilityService;

    beforeEach((() => {
        AppInjector.setInjector(injectorMock);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ExposuresDetailsComponent],
            providers: [
                FilterDefinitionsService,
                ErrorService,
                FiltersUtilityService,
                { provide: AlUrlFilterService, useClass: UrlFilterServiceMock },
                { provide: AlNavigationService, useClass: AlNavigationServiceMock }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExposuresDetailsComponent);
        component = fixture.componentInstance;
        filtersUtilityService = TestBed.get(FiltersUtilityService);
        alNavigationMockService = fixture.debugElement.injector.get(AlNavigationService);
        alNavigationMockService.routeParameters = {
            'exposureId': "test",
            'deploymentId': "9A4A67CF-C2FC-404C-BFC8-FFE78DAC0154",
            'remediationItemId': "128CEC2CD597B482AFA160DFFB658D32"
        };
    });

    it('Should create component', () => {
        expect(component).toBeTruthy();
    });

    it('Error Case - loadExposureDetail api response for exposure details', () => {

        alNavigationMockService.routeData = {
            pageData: {
                state: AppConstants.PageConstant.Open
            }
        };

        jest.spyOn(AlVulnerabilitiesClient, 'getVulnerability').mockReturnValue(Promise.reject("error"));
        jest.spyOn(AlAssetsQueryClient, 'queryExposures').mockReturnValue(Promise.reject("error"));

        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(component.showZeroState).toBeTruthy();
            expect(component.loadingData).toBeFalsy();
        });
    });

    it('Success Case - loadExposureDetail api response for exposure details', async() => {
        alNavigationMockService.routeData = {
            pageData: {
                state: AppConstants.PageConstant.Open
            }
        };

        jest.spyOn(AlVulnerabilitiesClient, 'getVulnerability').mockReturnValue(Promise.resolve(getVulnerabilityMockResponse));
        jest.spyOn(AlAssetsQueryClient, 'queryExposures').mockReturnValue(Promise.resolve(queryExposureMockResponse));
        jest.spyOn(AlDeploymentsClient, 'listDeployments').mockReturnValue(Promise.resolve(getDeploymentList));
        jest.spyOn(component, 'setRemainder').mockReturnValue();
        await fixture.detectChanges();  // await needed as setRemainder making call
        fixture.whenStable().then(() => {

            expect(component.deploymentIds.length).toBeGreaterThan(0);
            expect(component.vulnerabilityIds.length).toBeGreaterThan(0);

            expect(component.firstLoadFinished).toBeTruthy();
            expect(component.loadingData).toBeFalsy();

            expect(component.affectedAssets.length).toBeGreaterThan(0);
            expect(component.evidences.length).toBeGreaterThan(0);

        });
    });


    it('Error Case - loadRemediationItemDetail api response for exposure details', () => {
        alNavigationMockService.routeData = {
            pageData: {
                state: AppConstants.PageConstant.Concluded
            }
        };
        jest.spyOn(AlDeploymentsClient, 'listDeployments').mockReturnValue(Promise.reject("error"));
        jest.spyOn(AlVulnerabilitiesClient, 'getVulnerability').mockReturnValue(Promise.reject("error"));
        jest.spyOn(AlAssetsQueryClient, 'queryRemediationItems').mockReturnValue(Promise.reject("error"));
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(component.showZeroState).toBeTruthy();
            expect(component.loadingData).toBeFalsy();
        });
    });


    // it('Success Case - loadRemediationItemDetail api response for exposure details', () => {
    //     alNavigationMockService.routeData = {
    //         pageData: {
    //             state: AppConstants.PageConstant.Concluded
    //         }
    //     };

    //     jest.spyOn(AlDeploymentsClient, 'listDeployments').mockReturnValue(Promise.resolve(getDeploymentList));
    //     jest.spyOn(AlVulnerabilitiesClient, 'getVulnerability').mockReturnValue(Promise.resolve(getVulnerabilityMockResponse));
    //     jest.spyOn(AlAssetsQueryClient, 'queryRemediationItems').mockReturnValue(Promise.resolve(queryRemediationItemsMockResponse));
    //     fixture.detectChanges();
    //     fixture.whenStable().then(() => {
    //         expect(component.firstLoadFinished).toBeTruthy();
    //         expect(component.loadingData).toBeFalsy();

    //         expect(component.affectedAssets.length).toBeGreaterThan(0);
    //         expect(component.evidences.length).toBeGreaterThan(0);
    //     });
    // });
});
