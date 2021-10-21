import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FilterDefinitionsService } from '../services/filter-definitions.service';
import { DatePipe } from '@angular/common';
import { UrlFilterServiceMock } from '../../../testing/url-filter.service-mock';
import { AlNavigationService, AlNavigationServiceMock, AlUrlFilterService } from '@al/ng-navigation-components';
import { RouterTestingModule } from '@angular/router/testing';
import { CardGroupByPipe, AlCardstackComponent } from '@al/ng-cardstack-components';
import { AlBaseViewExposuresComponent } from './al-base-view-exposures.component';
import { AIMSUser, AlCardstackCharacteristics, AlCardstackItem, AlCardstackView, AlSession } from '@al/core';
import { FiltersUtilityService } from '../services/filters-utility.service';
import { AlFileDownloadService, AlToastService, AppInjector } from '@al/ng-generic-components';
import { AlDownloadCsvServiceMock } from '../../../testing/al-download-csv.service-mock';
import { AlDeploymentsClient, Deployment } from '@al/deployments';
import { AlAssetsQueryClient } from '@al/assets-query';
import { AlExposureConcludeMockComponent, AlExposureDisposeMockComponent } from '../../../testing';
const mockCharacteristics = require('../../../testing/mocks/al-cardstack-characteristics.json') as AlCardstackCharacteristics;

const injectorMock = {
    get(token: any) {
        return TestBed.inject(token);
    }
};

const usersMap: { [id: string]: AIMSUser } = {};

const alToastServiceMock = {
    showMessage() {}
};

/**
 * A concrete example to extend the abstract class and propertly mock behaviors.
 */
@Component({
    selector: 'al-test-component',
    template: '<al-exposure-dispose></al-exposure-dispose><al-exposure-conclude></al-exposure-conclude>'
})
class ParentTestComponent extends AlBaseViewExposuresComponent {
    protected async exportData(): Promise<string> {
        let data = "";
        const columnHeaders: string[] = [
            "Type",
            "Remediation",
            "Asset Type",
            "Health Level",
            "Category",
            "Asset Name",
            "Asset Key",
            "Availability Zone"
        ];
        data += this.getRow(columnHeaders);
        data += await this.getBody("Appliance", 'Open', usersMap);
        return data;
    }
}

class MockCardstackView extends AlCardstackView<{}, { id: string; caption: string }> {

    fetchData = () => Promise.resolve([]);
    deriveEntityProperties() {
        return { id: 'string', caption: 'string' };
    }
}

describe('AlBaseViewExposuresComponent', () => {
    let component: ParentTestComponent;
    let fixture: ComponentFixture<ParentTestComponent>;
    let alNavigationMockService: AlNavigationService;
    let filtersUtilityService: FiltersUtilityService;
    let filterDefinitionsService: FilterDefinitionsService;
    const getDeploymentList = require('../../../testing/mocks/deploymentsService/deployments-134282856.json') as Deployment[];
    beforeEach((() => {
        AppInjector.setInjector(injectorMock);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
                ParentTestComponent,
                AlExposureDisposeMockComponent,
                AlExposureConcludeMockComponent,
                AlCardstackComponent,
                CardGroupByPipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                FilterDefinitionsService,
                DatePipe,
                FiltersUtilityService,
                { provide: AlFileDownloadService, useClass: AlDownloadCsvServiceMock },
                { provide: AlUrlFilterService, useClass: UrlFilterServiceMock },
                { provide: AlNavigationService, useClass: AlNavigationServiceMock },
                { provide: AlToastService, useValue: alToastServiceMock },

            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ParentTestComponent);
        component = fixture.componentInstance;
        component.accountId = '2';
        alNavigationMockService = fixture.debugElement.injector.get(AlNavigationService);
        filtersUtilityService = fixture.debugElement.injector.get(FiltersUtilityService);
        filterDefinitionsService = fixture.debugElement.injector.get(FilterDefinitionsService);
        fixture.detectChanges();

        component.alCardstack = new AlCardstackComponent(alNavigationMockService);
        component.alCardstack.view = new MockCardstackView();
        component.alCardstack.view.characteristics = mockCharacteristics;
        component.alCardstack.view.filteredCards = require("../../../testing/mocks/misc/cards-data.mock.json");

    });

    it('It should create component', () => {
        expect(component).toBeTruthy();
    });

    describe('When processing snackbar events', () => {
        describe('for an export event', () => {
            beforeEach(() => {
                jest.spyOn(component.alDownloadCsvService, "downloadFile");
                jest.spyOn(AlDeploymentsClient, 'listDeployments').mockReturnValue(Promise.resolve(getDeploymentList));
                global.URL.createObjectURL = jest.fn();
            });
            it('SHOULD export the file when action on action snackbar event', async () => {
                await component.actionSnackbarEvent("export");
                expect(component.alDownloadCsvService.downloadFile).toHaveBeenCalled();
            });
        });
        describe('for a dispose event', () => {
            let undisposeSpy;
            beforeEach(() => {
                filtersUtilityService.activeStateFilter.label = 'Open';
                jest.spyOn(component.disposeAction.rightDrawer, 'open').mockImplementation(() => { });
            });
            describe('on a remediation', () => {
                beforeEach(() => {
                    component.currentSelection = [{
                        id: 'x',
                        caption: 'bla',
                        entity: {
                            deployment_id: 'dep-01',
                            remediation_id: 'rem-01',
                            exposures: [{
                                vinstances: [{
                                    target: {
                                        key: 'asset-01'
                                    }
                                }]
                            }]
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    }];
                    component.actionSnackbarEvent("dispose");
                });
                it('should populate the necessary param', () => {
                    expect(component.selectedItemDeploymentIds).toEqual(['dep-01']);
                    expect(component.selectedItemIds).toEqual(['rem-01']);
                    expect(component.disposeAction.rightDrawer.open).toHaveBeenCalledTimes(1);
                    expect(component.affectedAssetDetail.selectedAssetCount).toEqual(1);
                });
            });
            describe('on multiple remediations with same vinstance keys present', () => {
                beforeEach(() => {
                    component.currentSelection = [{
                        id: 'x',
                        caption: 'Remediation X',
                        entity: {
                            deployment_id: 'dep-01',
                            remediation_id: 'rem-01',
                            exposures: [{
                                vinstances: [{
                                    target: {
                                        key: 'asset-01'
                                    }
                                },
                                {
                                    target: {
                                        key: 'asset-02'
                                    }
                                },
                                {
                                    target: {
                                        key: 'asset-03'
                                    }
                                }]
                            }]
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    },
                    {
                        id: 'x',
                        caption: 'Remediation Y',
                        entity: {
                            deployment_id: 'dep-01',
                            remediation_id: 'rem-01',
                            exposures: [{
                                vinstances: [{
                                    target: {
                                        key: 'asset-01'
                                    }
                                },{
                                    target: {
                                        key: 'asset-03'
                                    }
                                }]
                            }]
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    }];
                    component.actionSnackbarEvent("dispose");
                });
                it('should populate the necessary param', () => {
                    expect(component.selectedItemDeploymentIds).toEqual(['dep-01']);
                    expect(component.selectedItemIds).toEqual(['rem-01']);
                    expect(component.disposeAction.rightDrawer.open).toHaveBeenCalledTimes(1);
                });
            });
            describe('on an exposure', () => {
                beforeEach(() => {
                    component.currentSelection = [{
                        id: 'x',
                        caption: 'bla',
                        entity: {
                            deployment_id: 'dep-01',
                            vulnerability_id: 'vuln-01',
                            vinstances: [{
                                target: {
                                    key: 'asset-01'
                                }
                            }]
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    }];
                    component.viewName = 'exposures';
                    component.actionSnackbarEvent("dispose");
                });
                it('should populate the necessary param', () => {
                    expect(component.selectedItemDeploymentIds).toEqual(['dep-01']);
                    expect(component.selectedItemIds).toEqual(['vuln-01']);
                    expect(component.disposeAction.rightDrawer.open).toHaveBeenCalledTimes(1);
                    expect(component.affectedAssetDetail.selectedAssetCount).toEqual(1);
                });
            });
            describe('on multiple exposures with same vinstance keys present', () => {
                beforeEach(() => {
                    component.currentSelection = [{
                        id: 'x',
                        caption: 'Exposure A',
                        entity: {
                            deployment_id: 'dep-01',
                            vulnerability_id: 'vuln-01',
                            vinstances: [{
                                target: {
                                    key: 'asset-01'
                                }
                            },{
                                target: {
                                    key: 'asset-02'
                                }
                            }]
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    },{
                        id: 'y',
                        caption: 'Exposure B',
                        entity: {
                            deployment_id: 'dep-01',
                            vulnerability_id: 'vuln-01',
                            vinstances: [{
                                target: {
                                    key: 'asset-01'
                                }
                            }]
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    }];
                    component.viewName = 'exposures';
                    component.actionSnackbarEvent("dispose");
                });
                it('should populate the necessary param', () => {
                    expect(component.selectedItemDeploymentIds).toEqual(['dep-01']);
                    expect(component.selectedItemIds).toEqual(['vuln-01']);
                    expect(component.disposeAction.rightDrawer.open).toHaveBeenCalledTimes(1);
                    expect(component.affectedAssetDetail.selectedAssetCount).toEqual(2);
                });
            });
        });
        describe('for a conclude event', () => {
            beforeEach(() => {
                filtersUtilityService.activeStateFilter.label = 'Open';
                jest.spyOn(component.concludeAction.rightDrawer, 'open').mockImplementation(() => { });
            });
            describe('on a remediation', () => {
                beforeEach(() => {
                    component.currentSelection = [{
                        id: 'x',
                        caption: 'bla',
                        entity: {
                            deployment_ids: ['dep-01'],
                            remediation_id: 'rem-01',
                            exposures: [{
                                vinstances: [{
                                    target: {
                                        key: 'asset-01'
                                    }
                                }]
                            }]
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    }];
                    component.actionSnackbarEvent("conclude");
                });
                it('should populate the necessary param', () => {
                    expect(component.selectedItemDeploymentIds).toEqual(['dep-01']);
                    expect(component.selectedItemIds).toEqual(['rem-01']);
                    expect(component.concludeAction.rightDrawer.open).toHaveBeenCalledTimes(1);
                    expect(component.affectedAssetDetail.selectedAssetCount).toEqual(1);
                });
            });
        });
        describe('for a restore event', () => {
            let undisposeSpy: jest.SpyInstance;
            beforeEach(() => {
                filtersUtilityService.activeStateFilter.label = 'Disposed';
                jest.spyOn(component.alCardstack.view, 'start').mockReturnValue(Promise.resolve());
                undisposeSpy = jest.spyOn(AlAssetsQueryClient, 'undisposeRemediationItems').mockReturnValue(Promise.resolve({}));

            });
            afterEach(() => {
              undisposeSpy.mockClear();
            });
            describe('on one audit-id AND one NON audit-id based vulnerabilty remediation-item ', () => {
                beforeEach(() => {
                    component.currentSelection = [{
                        id: 'x',
                        caption: 'bla',
                        entity: {
                            audit_id: 'audit-01',
                            vulnerability_id: 'vuln-01'
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    }, {
                        id: 'x',
                        caption: 'bla',
                        entity: {
                            item_ids: ['item-01'],
                            vulnerability_id: 'vuln-01'
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    }];
                    component.actionSnackbarEvent("restore");
                });
                it('should peform two undispose API operations with the correct params', () => {
                    expect(undisposeSpy).toHaveBeenCalledTimes(2);
                    expect(undisposeSpy.mock.calls[0]).toEqual(['2', { audit_ids: ['audit-01'], vulnerability_ids: ['vuln-01'] }]);
                    expect(undisposeSpy.mock.calls[1]).toEqual(['2', { remediation_item_ids: ['item-01'] }]);
                });
            });
            describe('on two same valued audit-id based vulnerabilty remediation-items', () => {
                beforeEach(() => {
                    component.currentSelection = [{
                        id: 'x',
                        caption: 'bla',
                        entity: {
                            audit_id: 'audit-01',
                            vulnerability_id: 'vuln-01'
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    }, {
                        id: 'x',
                        caption: 'bla',
                        entity: {
                            audit_id: 'audit-01',
                            vulnerability_id: 'vuln-02'
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    }];
                    component.actionSnackbarEvent("restore");
                });
                it('should peform one undispose API operations with the correct params', () => {
                    expect(undisposeSpy).toHaveBeenCalledTimes(1);
                    expect(undisposeSpy.mock.calls[0]).toEqual(['2', { audit_ids: ['audit-01'], vulnerability_ids: ['vuln-01','vuln-02'] }]);
                });
            });
            describe('on one NON audit-id based remediation remediation-item ', () => {
                beforeEach(() => {
                    component.currentSelection = [{
                        id: 'x',
                        caption: 'bla',
                        entity: {
                            audit_id: 'audit-01',
                            remediation_id: 'rem-01'
                        },
                        properties: {
                            id: '',
                            caption: ''
                        }
                    }];
                    component.actionSnackbarEvent("restore");
                });
                it('should peform one undispose API operations with the correct params', () => {
                    expect(undisposeSpy).toHaveBeenCalledTimes(1);
                    expect(undisposeSpy.mock.calls[0]).toEqual(['2', { audit_ids: ['audit-01'], remediation_ids: ['rem-01'] }]);
                });
            });
        });
    });

    describe('When navigating to a detail view', ()=> {
        beforeEach(() => {
            jest.spyOn(alNavigationMockService.navigate, 'byLocation');
            jest.spyOn(alNavigationMockService.navigate, 'byNgRoute');
            jest.spyOn(AlSession, 'getActingAccountId').mockReturnValue('2');
        });
        describe('from the Concluded exposures list', () => {
            beforeEach(() => {
                alNavigationMockService.routeData.pageData.state = 'concluded';
                component.viewName = 'exposures';
            });
            describe('for an item with items_ids present', () => {
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
                it('Should navigate to detail page when goToDetailPage get call with concluded state ', () => {
                    component.goToDetailPage({} as MouseEvent, item);
                    expect(alNavigationMockService.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'exposures', 'concluded', '2', '4B66677-EEF9-4F74-8A9C-FFE24EC1A653', 'xyz'], { queryParams: {search: null}});
                });
                describe('with mouse event ctrlKey set to true', () => {
                    it('Should navigate to detail page when goToDetailPage get call with concluded state ', () => {
                        component.goToDetailPage({ctrlKey: true} as MouseEvent, item);
                        expect(alNavigationMockService.navigate.byLocation).toHaveBeenCalledWith('cd21:magma', '/#/exposure-management/exposures/concluded/2/4B66677-EEF9-4F74-8A9C-FFE24EC1A653/xyz', {}, {target: '_blank'});
                    });
                });
            });
            describe('for an item with items_ids and a deployment_id present', () => {
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
                        audit_id: 'xyz'
                    }
                };
                it('Should navigate to detail page when goToDetailPage get call with concluded state ', () => {
                    component.goToDetailPage({} as MouseEvent, item);
                    expect(alNavigationMockService.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'exposures', 'concluded', '2', '4B66677-EEF9-4F74-8A9C-FFE24EC1A653', 'xyz', '5fe231de3e31ac7064df974341cb6efc'], { queryParams: {search: null}});
                });
                describe('with mouse event ctrlKey set to true', () => {
                    it('Should navigate to detail page when goToDetailPage get call with concluded state ', () => {
                        component.goToDetailPage({ctrlKey: true} as MouseEvent, item);
                        expect(alNavigationMockService.navigate.byLocation).toHaveBeenCalledWith('cd21:magma', '/#/exposure-management/exposures/concluded/2/4B66677-EEF9-4F74-8A9C-FFE24EC1A653/xyz/5fe231de3e31ac7064df974341cb6efc', {}, {target: '_blank'});
                    });
                });
            });
        });
        describe('from the Disposed remediations list', () => {
            beforeEach(() => {
                alNavigationMockService.routeData.pageData.state = 'disposed';
                component.viewName = 'remediations';
            });
            describe('for an item with items_ids present', () => {
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
                it('Should navigate to detail page when goToDetailPage get call with concluded state ', () => {
                    component.goToDetailPage({} as MouseEvent, item);
                    expect(alNavigationMockService.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'remediations', 'disposed', '2', '4B66677-EEF9-4F74-8A9C-FFE24EC1A653', 'xyz'], { queryParams: {search: null}});
                });
                describe('with mouse event ctrlKey set to true', () => {
                    it('Should navigate to detail page when goToDetailPage get call with concluded state ', () => {
                        component.goToDetailPage({ctrlKey: true} as MouseEvent, item);
                        expect(alNavigationMockService.navigate.byLocation).toHaveBeenCalledWith('cd21:magma', '/#/exposure-management/remediations/disposed/2/4B66677-EEF9-4F74-8A9C-FFE24EC1A653/xyz', {}, {target: '_blank'});
                    });
                });
            });
            describe('for an item with audit_id, remediation_id and deployment_ids present', () => {
                const item: AlCardstackItem = {
                    id: '1',
                    caption: 'Test',
                    properties: {},
                    entity: {
                        exposures: [{
                            vulnerability_id: "5fe231de3e31ac7064df974341cb6efc"
                        }],
                        remediation_id: "5fe231de3e31ac7064df974341cb6efc",
                        deployment_ids: ["4B66677-EEF9-4F74-8A9C-FFE24EC1A653"],
                        audit_id: 'xyz'
                    }
                };
                it('Should navigate to detail page when goToDetailPage get call with concluded state ', () => {
                    component.goToDetailPage({} as MouseEvent, item);
                    expect(alNavigationMockService.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'remediations', 'disposed', '2', '4B66677-EEF9-4F74-8A9C-FFE24EC1A653', 'xyz', '5fe231de3e31ac7064df974341cb6efc'], { queryParams: {search: null}});
                });
                describe('with mouse event ctrlKey set to true', () => {
                    it('Should navigate to detail page when goToDetailPage get call with concluded state ', () => {
                        component.goToDetailPage({ctrlKey: true} as MouseEvent, item);
                        expect(alNavigationMockService.navigate.byLocation).toHaveBeenCalledWith('cd21:magma',
                            '/#/exposure-management/remediations/disposed/2/4B66677-EEF9-4F74-8A9C-FFE24EC1A653/xyz/5fe231de3e31ac7064df974341cb6efc', {}, {target: '_blank'});
                    });
                });
            });
        });
        describe('from the Open exposures list', () => {
            beforeEach(() => {
                alNavigationMockService.routeData.pageData.state = 'open';
                component.viewName = 'exposures';
            });
            describe('for an item with items_ids present', () => {
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
                it('Should navigate to detail page when goToDetailPage get call with concluded state ', () => {
                    component.goToDetailPage({} as MouseEvent, item);
                    expect(alNavigationMockService.navigate.byNgRoute).toHaveBeenCalledWith(['exposure-management', 'exposures', 'open', '2', '1'], { queryParams: {search: null}});
                });
                describe('with mouse event ctrlKey set to true', () => {
                    it('Should navigate to detail page when goToDetailPage get call with concluded state ', () => {
                        component.goToDetailPage({ctrlKey: true} as MouseEvent, item);
                        expect(alNavigationMockService.navigate.byLocation).toHaveBeenCalledWith('cd21:magma', '/#/exposure-management/exposures/open/2/1', {}, {target: '_blank'});
                    });
                });
            });
        });
    });

    it('It should hide snackbar', () => {
        component['closeActionSnackbar']();
        expect(component.actionSnackbarVisible).toBeFalsy();
        expect(component.actionSnackbarText).toBe('');
    });

    it('It should open snackbar', () => {
        component['openActionSnackbar']('ExposureTest');
        expect(component.actionSnackbarVisible).toBeTruthy();
        expect(component.actionSnackbarText).toBe('ExposureTest');
    });

    it('It should open snackbar', () => {
        component['actionSnackbarProccess']();
        expect(component.actionSnackbarVisible).toBeFalsy();
        expect(component.actionSnackbarText).toBe('');
    });

    it('It should initialiseCardstackView ', () => {
        alNavigationMockService.queryParams = {
            'no_filters': 'true'
        };
        jest.spyOn(filtersUtilityService, 'preLoadAdditonalAssetData').mockReturnValue(Promise.resolve(getDeploymentList));
        filtersUtilityService.activeStateFilter = { label: 'Open', key: 'health_level:2', iconClass: 'material-icons', icon: 'warning', showTotal: false, total: 0 };
        component.initialiseCardstackView('dummyView', true);
    });

    it('It should open snackbar', () => {
        let card: AlCardstackItem<any, any> = {
            id: '1000',
            caption: 'Exposure Test Card',
            entity: 'Network',
            properties: {}
        };
        component.currentSelection = [card];
        component['actionSnackbarProccess']();
        expect(component.actionSnackbarVisible).toBeTruthy();
        expect(component.actionSnackbarText).toBe('1 Selected');
    });

    describe('On attempting to restore filters', () => {
        beforeEach(() => {
            jest.spyOn(filterDefinitionsService, 'filterValuesToApply');
        });
        describe('from incoming URL query parameters with repeating values', () => {
            it('should dedupe these values before attemping to apply the filters', () => {
                jest.spyOn(filtersUtilityService, 'getSelectedFiltersFromStorage').mockReturnValue([]);
                jest.spyOn(filtersUtilityService, 'getSelectedFiltersFromQueryParam').mockReturnValue(['severity:high,high']);
                jest.spyOn(filtersUtilityService, 'addSelectedFiltersToStorage').mockImplementation(()=>{});
                component.restoreDefinitionsFromLocalStorage('bla');
                expect(filtersUtilityService.addSelectedFiltersToStorage).toHaveBeenCalledWith(['severity:high'], 'bla', 'open');
                expect(filterDefinitionsService.filterValuesToApply).toHaveBeenCalledWith(['severity:high']);
            });
        });
        describe('from saved local values in localstorage', () => {
            it('should dedupe these values before attemping to apply the filters', () => {
                jest.spyOn(filtersUtilityService, 'getSelectedFiltersFromStorage').mockReturnValue(['severity:high,high']);
                jest.spyOn(filtersUtilityService, 'getSelectedFiltersFromQueryParam').mockReturnValue([]);
                component.restoreDefinitionsFromLocalStorage('bla');
                expect(filterDefinitionsService.filterValuesToApply).toHaveBeenCalledWith(['severity:high']);
            });
        });
    });
});
