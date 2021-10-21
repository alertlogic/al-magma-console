import { RemediationsCardstackView } from "./remediations.cardstack";
import { TestBed } from '@angular/core/testing';
import { FilterDefinitionsService } from '../services/filter-definitions.service';
import { FiltersUtilityService } from '../services/filters-utility.service';
import { RouterTestingModule } from '@angular/router/testing';

import { AlNavigationService, AlUrlFilterService } from '@al/ng-navigation-components';
import { AlNavigationServiceMock } from '@al/ng-navigation-components/testing';
import { UrlFilterServiceMock } from '../../../testing/url-filter.service-mock';
import { AlAssetsQueryClient, ExposureQueryResultItem, RemediationItemsQueryResponse, HealthAssetVPC, HealthAssetDeployment, ExposuresQueryResponse } from '@al/assets-query';
import { AlSession, AlCardstackCharacteristics, AIMSClient, AIMSUser } from '@al/core';
import { AppConstants } from '../constants';
import { AppInjector } from "@al/ng-generic-components";

const injectorMock = {
    get(token: any) {
        return TestBed.get(token);
    }
};

const mockCharacteristics: AlCardstackCharacteristics = require('../../../testing/mocks/al-cardstack-characteristics.json') as AlCardstackCharacteristics;
const mockUser:AIMSUser = require('../../../testing/mocks/al-user-10000.json');

describe('RemediationsCardstackView', () => {
    let remediationCardstackView: RemediationsCardstackView;
    let filterUtilityService: FiltersUtilityService;
    beforeEach(async () => {
        AppInjector.setInjector(injectorMock);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                FilterDefinitionsService,
                FiltersUtilityService,
                { provide: AlUrlFilterService, useClass: UrlFilterServiceMock },
                { provide: AlNavigationService, useClass: AlNavigationServiceMock }
            ]
        });
        filterUtilityService = TestBed.get(FiltersUtilityService);

        filterUtilityService.assetsList = {
            collector: {},
            deployment: {},
            remediation1: {}
        };
        remediationCardstackView = new RemediationsCardstackView(filterUtilityService, TestBed.get(FilterDefinitionsService));
    });

    it('it should create service', () => {
        expect(remediationCardstackView).toBeTruthy();
    });

    it('it should call deriveEntityProperties', () => {
        let exposureQueryItem: ExposureQueryResultItem = {
            remediation_id: 'test',
            name: 'Test Remediation',
            categories: [],
            type: 'exposure',
            exposures: []
        };
        let derivedProps = remediationCardstackView.deriveEntityProperties(exposureQueryItem);
        expect(derivedProps.id).toEqual(exposureQueryItem.remediation_id);
    });


    it('it should start service & call fetchData()', async() => {
        let queryRemediationItemsMockResponse: RemediationItemsQueryResponse = {
            filters: [],
            summary: {
                severities: {}
            },
            'remediation-items': {
                assets: [
                    {
                        user_id: '10000'
                    }
                ]
            }
        };
        filterUtilityService.activeStateFilter = {
            label: 'Disposed',
            icon: 'block',
            iconClass: 'material-icons',
            showTotal: false
        };

        jest.spyOn(AlSession, 'getActingAccountId').mockImplementation(()=>{
            return '10000';
        });
        jest.spyOn(AIMSClient, 'getUserDetailsByUserId').mockImplementation(() => Promise.resolve(mockUser));
        jest.spyOn(AlAssetsQueryClient, 'queryRemediationItems').mockImplementation(() => Promise.resolve(queryRemediationItemsMockResponse));
        jest.spyOn(filterUtilityService, 'prepareRemediationItemsQueryParams').mockReturnValue(
            {
                filter: [],
                detailed_filters: true,
                state: AppConstants.PageConstant.Concluded,
                details: false,
                group_by_audit_id: false
            }
        );
        remediationCardstackView.characteristics = mockCharacteristics;

        await remediationCardstackView.fetchData(false,[{}]); // this will trigger fetchData method
    });

    it('it should clear the filter if no record found with given filters', () => {
        let remoteFilter = [{}];
        let queryExposuresMockResponse:ExposuresQueryResponse = {
            remediations: {
                assets: []
            },
            summary: {severities: {all:1}}
        };
        jest.spyOn(AlSession, 'getActingAccountId').mockReturnValue('10000');
        jest.spyOn(AIMSClient, 'getUserDetailsByUserId').mockImplementation(() => Promise.resolve(mockUser));

        jest.spyOn(AlAssetsQueryClient, 'queryExposures').mockImplementation(() => Promise.resolve(queryExposuresMockResponse));
        jest.spyOn(filterUtilityService, 'prepareExposuresQueryParams').mockReturnValue({
                filter: [],
                scope: true,
                details: false,
                disposed: true
            }
        );
        remediationCardstackView.characteristics = mockCharacteristics;
        remediationCardstackView.fetchData(false, remoteFilter);
    });

    it('it should buildSubtitleText', () => {
        let mockDeployment: HealthAssetDeployment = {
            name: 'aws test deployment'
        };
        let mockNetwork: HealthAssetVPC = {
            cidr_ranges: [
                "10.11.12.13"
            ]
        };
        let subtitle = remediationCardstackView.buildSubtitleText(mockDeployment, mockNetwork);
        expect(subtitle).toEqual("aws test deployment | 10.11.12.13");
    });
});
