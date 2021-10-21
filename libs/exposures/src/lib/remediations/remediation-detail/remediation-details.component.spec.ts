import { Deployment, AlDeploymentsClient } from '@al/deployments';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FiltersUtilityService, FilterDefinitionsService, ErrorService } from '../../services';
import { AlNavigationService, AlNavigationServiceMock, AlUrlFilterService } from '@al/ng-navigation-components';
import { RemediationDetailComponent } from './remediation-detail.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UrlFilterServiceMock } from '../../../../testing';
import { AlSession } from '@al/core';
import { AlVulnerabilitiesClient, Remediation } from '@al/vulnerabilities';
import { AlAssetsQueryClient, ExposuresQueryResponse, RemediationItemsQueryResponse } from '@al/assets-query';
import { AppConstants } from '../../constants';
import { AppInjector } from '@al/ng-generic-components';

const injectorMock = {
    get(token: any) {
        return TestBed.inject(token);
    }
};

describe('RemediationDetailComponent', () => {
    let component: RemediationDetailComponent;
    let fixture: ComponentFixture<RemediationDetailComponent>;
    let filtersUtilityService: FiltersUtilityService;
    let alNavigationService: AlNavigationService;
    const asset: { [k: string]: any } = { parentExposures: {} };
    const getRemediationDetailByQueryExposuresData = require('../../../../testing/mocks/remediation-details/getRemediationDetailByQueryExposures.json') as ExposuresQueryResponse;
    const getRemediationByIdApiResponseData = require('../../../../testing/mocks/remediation-details/getRemediationById.json') as Remediation;
    const getRemediationItemByIdQueryParamsData = require('../../../../testing/mocks/remediation-details/getRemediationItemByIdQueryParams.json') as RemediationItemsQueryResponse;
    const getDeploymentList = require('../../../../testing/mocks/deploymentsService/deployments-134282856.json') as Deployment[];
    beforeEach((() => {
        AppInjector.setInjector(injectorMock);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [RemediationDetailComponent,
            ],

            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                FilterDefinitionsService, ErrorService, FiltersUtilityService,
                { provide: AlUrlFilterService, useClass: UrlFilterServiceMock },
                { provide: AlNavigationService, useClass: AlNavigationServiceMock }
            ]

        }).compileComponents();

    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RemediationDetailComponent);
        component = fixture.componentInstance;
        filtersUtilityService = TestBed.inject(FiltersUtilityService);
        jest.spyOn(AlSession, 'getActingAccountId').mockReturnValue('134249236');
        alNavigationService = fixture.debugElement.injector.get(AlNavigationService);
        alNavigationService.routeParameters = {
            'remediationId': "agent_install_agent",
            'deploymentId': "9A4A67CF-C2FC-404C-BFC8-FFE78DAC0154",
            'remediationItemId': "128CEC2CD597B482AFA160DFFB658D32"
        };

    });

    it('should create', () => {
        expect(component).toBeTruthy();

    });


    it('should call loadRemediationItemDetail() if state is conclude/Dispose', fakeAsync(() => {
        expect(component.loadingData).toBeTruthy();
        expect(component.firstLoadFinished).toBeFalsy();
        jest.spyOn(filtersUtilityService, 'preLoadAdditonalAssetData').mockReturnValue(Promise.resolve(getDeploymentList));
        jest.spyOn(AlVulnerabilitiesClient, 'getRemediation').mockReturnValue(Promise.resolve(getRemediationByIdApiResponseData));
        jest.spyOn(AlAssetsQueryClient, 'queryRemediationItems').mockReturnValue(Promise.resolve(getRemediationItemByIdQueryParamsData));
        jest.spyOn(component, 'getAssetFromVInstance').mockReturnValue(asset);

        fixture.detectChanges();
        tick(1000);
        expect(component.remediation).toEqual(getRemediationByIdApiResponseData);
        expect(component.remediationItem).toEqual(getRemediationItemByIdQueryParamsData["remediation-items"].assets[0]);

        expect(component.titles.upperTitle).toEqual('Configuration Remediation');
        expect(component.affectedAssets.length).toBeGreaterThan(0);
        expect(component.evidences.length).toBeGreaterThan(0);
        expect(component.exposuresList.length).toBeGreaterThan(0);
        expect(component.loadingData).toBeFalsy();
        expect(component.firstLoadFinished).toBeTruthy();
        expect(component.filters.length).toEqual(0);

    }));

    it('should call loadRemediationDetail() if state is Open', fakeAsync(() => {
        alNavigationService.routeData = {
            pageData: {
                state: AppConstants.PageConstant.Open
            }
        };
        expect(component.loadingData).toBeTruthy();
        expect(component.firstLoadFinished).toBeFalsy();
        jest.spyOn(filtersUtilityService, 'prepareExposuresByIdQueryParams').mockReturnValue({});
        jest.spyOn(filtersUtilityService, 'preLoadAdditonalAssetData').mockReturnValue(Promise.resolve(getDeploymentList));
        jest.spyOn(AlVulnerabilitiesClient, 'getRemediation').mockReturnValue(Promise.resolve(getRemediationByIdApiResponseData));
        jest.spyOn(AlAssetsQueryClient, 'queryExposures').mockReturnValue(Promise.resolve(getRemediationDetailByQueryExposuresData));
        jest.spyOn(AlDeploymentsClient, 'listDeployments').mockReturnValue(Promise.resolve(getDeploymentList));
        jest.spyOn(component, 'getAssetFromVInstance').mockReturnValue(asset);
        fixture.detectChanges();
        tick(1000);

        expect(component.remediation).toEqual(getRemediationByIdApiResponseData);
        expect(component.remediationIds[0]).toEqual(getRemediationDetailByQueryExposuresData.remediations.assets[0].remediation_id);
        expect(component.deploymentIds[0]).toEqual(getRemediationDetailByQueryExposuresData.remediations.assets[0].deployment_ids[0]);
        expect(component.filters.length).toBeGreaterThan(0);
        expect(component.affectedAssets.length).toBeGreaterThan(0);
        expect(component.evidences.length).toBeGreaterThan(0);
        expect(component.exposuresList.length).toBeGreaterThan(0);
        expect(component.loadingData).toBeFalsy();
        expect(component.titles.upperTitle).toEqual('Configuration Remediation');
        expect(component.firstLoadFinished).toBeTruthy();
    }));

    it('if api return no records navigate back to view page', fakeAsync(() => {

        alNavigationService.routeData = {
            pageData: {
                state: AppConstants.PageConstant.Open
            }
        };
        jest.spyOn(filtersUtilityService, 'prepareExposuresByIdQueryParams').mockReturnValue({});
        jest.spyOn(filtersUtilityService, 'preLoadAdditonalAssetData').mockReturnValue(Promise.resolve(getDeploymentList));
        jest.spyOn(AlVulnerabilitiesClient, 'getRemediation').mockReturnValue(Promise.resolve(getRemediationByIdApiResponseData));
        jest.spyOn(alNavigationService.navigate,'byNgRoute').mockReturnValue();
        jest.spyOn(AlAssetsQueryClient, 'queryExposures').mockReturnValue(Promise.resolve({
            'remediations': {
                "rows": 0
            }
        }));
        jest.spyOn(AlDeploymentsClient, 'listDeployments').mockReturnValue(Promise.resolve(getDeploymentList));

        fixture.detectChanges();
        tick(1000);
        expect(alNavigationService.navigate.byNgRoute).toHaveBeenCalled();

    }));
});
