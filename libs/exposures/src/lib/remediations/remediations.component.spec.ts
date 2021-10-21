import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RemediationsComponent } from './remediations.component';
import { FilterDefinitionsService } from '../services/filter-definitions.service';
import { DatePipe } from '@angular/common';
import { FiltersUtilityService } from '../services/filters-utility.service';
import { FilterUtilityServiceMock } from '../../../testing/filter-utility-service-mock';

import { UrlFilterServiceMock } from '../../../testing/url-filter.service-mock';
import { AlNavigationServiceMock } from '@al/ng-navigation-components/testing';
import { AlNavigationService, AlUrlFilterService } from '@al/ng-navigation-components';
import { RouterTestingModule } from '@angular/router/testing';
import { AlCardstackItem, AlSession } from '@al/core';
import { ExposureQueryResultItem } from '@al/assets-query';
import { RemediationProperties } from './remediations.cardstack';
import { AppConstants } from '../constants';
import { AlStateFilterDescriptor, AppInjector } from '@al/ng-generic-components';
import { CardGroupByPipe, AlCardstackComponent } from '@al/ng-cardstack-components';

const injectorMock = {
    get(token: any) {
        return TestBed.inject(token);
    }
};

describe('RemediationsComponent', () => {
    let component: RemediationsComponent;
    let fixture: ComponentFixture<RemediationsComponent>;
    let card: AlCardstackItem;
    let alNavigationMockService: AlNavigationService;

    beforeEach((() => {
        AppInjector.setInjector(injectorMock);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [RemediationsComponent, AlCardstackComponent, CardGroupByPipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                FilterDefinitionsService,
                DatePipe,
                { provide: FiltersUtilityService, userClass: FilterUtilityServiceMock },
                { provide: AlUrlFilterService, useClass: UrlFilterServiceMock },
                { provide: AlNavigationService, useClass: AlNavigationServiceMock }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RemediationsComponent);
        component = fixture.componentInstance;
        alNavigationMockService = fixture.debugElement.injector.get(AlNavigationService);
        alNavigationMockService.routeData = {pageData: {state: 'open'}};
        jest.spyOn(component,'initialiseCardstackView').mockImplementation(() => Promise.resolve());
        fixture.detectChanges();


        card = {
            id: 'test',
            caption: 'Test',
            entity: {
                audit_id: 'audit-1',
                deployment_id: 'dep-1',
                exposures: [{
                    vulnerability_id: 'test'
                }],
                remediation_id: 'rem-1',
            },
            properties: {
                icon: {
                    text: 'al-icon'
                },
                toptitle: 'toptitle',
                caption: 'caption test',
                id: 'test',
                assetCollector: {
                    collector_region: 'us-east',
                    native_id: 'XCVBNCVB',
                    collector_type: 'paws'
                },
                severities: {},
                deploymentNames: ['testDeployment']
            }
        };
    });

    it('SHOULD create component', () => {
        expect(component).toBeTruthy();
    });

    it('SHOULD export remediations data', () => {
        component['exportData']();
    });

    it('SHOULD getRemediationDetails', () => {
        let item: AlCardstackItem<ExposureQueryResultItem, RemediationProperties> = {
            id: 'remediationId',
            caption: 'Test caption',
            properties: {
                id: 'remediationId',
                caption: 'Test caption',
                toptitle: 'Connection',
                category: 'test',
                severities: {},
                vinstances_count: 1,
                accountName: 'Test',
                deploymentNames: [],
                deployment_ids: ["aws001"]
            },
            entity: {}
        };

        let data = component['getRemediationDetails'](item);
        expect(data.toptitle).toEqual(item.properties.toptitle);

    });

    it('SHOULD goToDetailPage', () => {
        alNavigationMockService.routeData = {
            pageData: {
                state: AppConstants.PageConstant.Disposed
            }
        };
        jest.spyOn(alNavigationMockService.navigate, 'byNgRoute').mockReturnValue();
        jest.spyOn(AlSession, 'getActingAccountId').mockReturnValue('10000');
        component.goToDetailPage({} as MouseEvent, card);
        expect(alNavigationMockService.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'remediations', 'disposed', '10000', 'dep-1', 'audit-1', 'rem-1'], { queryParams: {search: null}});
    });

    it('It should call onStateFilterChanged method on state filter', () => {
        let stateFilter: AlStateFilterDescriptor = {
            icon: "block",
            iconClass: "material-icons",
            label: "Disposed",
            showTotal: false
        };

        jest.spyOn(alNavigationMockService.navigate, 'byNgRoute').mockReturnValue();
        jest.spyOn(AlSession, 'getActingAccountId').mockReturnValue('10000');
        component.onStateFilterChanged(stateFilter);
        expect(alNavigationMockService.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'remediations', 'disposed', '10000'], { queryParams: { search: null } });
    });
});
