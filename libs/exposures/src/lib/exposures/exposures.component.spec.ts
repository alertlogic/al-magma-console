import { AlSession, AlCardstackItem } from '@al/core';
import { UrlFilterServiceMock } from '../../../testing/url-filter.service-mock';
import { AlNavigationServiceMock } from '@al/ng-navigation-components/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AlUrlFilterService, AlNavigationService } from '@al/ng-navigation-components';
import { FilterDefinitionsService, FiltersUtilityService } from '../services';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AlStateFilterDescriptor, AppInjector } from '@al/ng-generic-components';
import { AlCardstackComponent, CardGroupByPipe } from '@al/ng-cardstack-components';
import { ExposuresComponent } from './exposures.component';
import { AppConstants } from '../constants';


const injectorMock = {
    get(token: any) {
        return TestBed.inject(token);
    }
};

const item: AlCardstackItem = {
    id: '1',
    caption: 'Test',
    properties: {},
    entity: {
        exposures: [
            {
                vulnerability_id: "5fe231de3e31ac7064df974341cb6efc"
            }
        ],
        deployment_id: "4B66677-EEF9-4F74-8A9C-FFE24EC1A653",
        item_ids: ['xyz']
    }
};
describe('ExposuresComponent', () => {
    let component: ExposuresComponent;
    let fixture: ComponentFixture<ExposuresComponent>;
    let alNavigationMockService: AlNavigationService;
    beforeEach((() => {
        AppInjector.setInjector(injectorMock);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ExposuresComponent, AlCardstackComponent, CardGroupByPipe],
            providers: [
                FilterDefinitionsService, FiltersUtilityService, DatePipe,
                { provide: AlUrlFilterService, useClass: UrlFilterServiceMock },
                { provide: AlNavigationService, useClass: AlNavigationServiceMock }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExposuresComponent);
        component = fixture.componentInstance;

        alNavigationMockService = fixture.debugElement.injector.get(AlNavigationService);
        alNavigationMockService.routeData = {pageData: {state: 'open'}};
        jest.spyOn(component,'initialiseCardstackView').mockReturnValue(Promise.resolve());
        jest.spyOn(AlSession, 'getActingAccountId').mockReturnValue('2');
        jest.spyOn(alNavigationMockService.navigate, 'byNgRoute').mockReturnValue();
        fixture.detectChanges();
    });

    it('Should create component', () => {
        expect(component).toBeTruthy();
    });


    it('Should call onStateFilterChanged method on state filter', () => {
        let healthState: AlStateFilterDescriptor = {
            icon: "check_circle",
            iconClass: "material-icons",
            label: "concluded",
            showTotal: false
        };

        component.onStateFilterChanged(healthState);
        expect(alNavigationMockService.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'exposures', 'concluded', '2'], { queryParams: { search: null} });
    });

    it('Should export agent view data', () => {
        component['exportData']();
    });

    it('Should navigate to detail page when goToDetailPage get call with concluded state ', () => {
        alNavigationMockService.routeData = {
          pageData: {
              state: AppConstants.PageConstant.Concluded
          }
        };
        component.goToDetailPage({} as MouseEvent, item);
        expect(alNavigationMockService.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'exposures', 'concluded', '2', '4B66677-EEF9-4F74-8A9C-FFE24EC1A653', 'xyz'], { queryParams: {search: null}});
    });

    it('Should navigate to detail page when goToDetailPage get call with open state ', () => {

        alNavigationMockService.routeData = {
            pageData: {
                state: AppConstants.PageConstant.Open
            }
        };

        component.goToDetailPage({} as MouseEvent, item);
        expect(alNavigationMockService.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'exposures', 'open', '2', '1'], { queryParams: {search: null} });
    });


});
