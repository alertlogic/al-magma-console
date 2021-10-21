import { FilterDefinitionsService } from "./filter-definitions.service";
import { TestBed } from "@angular/core/testing";
import { FiltersUtilityService } from "./filters-utility.service";
import { AssetTypeDictionary, ExposuresQueryFilter, RemediationItemAsset, RemediationItemsFilter } from "@al/assets-query";
import { AlCardstackViewCharacteristics } from "@al/ng-cardstack-components";
import { AlCardstackValueDescriptor } from "@al/core";
import { AlUrlFilterService } from '@al/ng-navigation-components';
import { UrlFilterServiceMock } from '../../../testing';
import { Deployment } from '@al/deployments';

const filterUtilityServiceMock = {
    assetsList: {},
    extraAssetDetails: {},
    activeStateFilter: {
        key: 'health_level:2'
    },

    createDeploymentDictionary(){
        return {};
    }
};

const mockCharacteristics: AlCardstackViewCharacteristics = {
    entity: {
        property: 'foo',
        caption: 'FOO',
        values: null,
        metadata: {}
    },
    groupableBy: [],
    filterableBy: [],
    sortableBy: [],
    definitions: {},
    remoteSearch: false,
    greedyConsumer: false,
    filterValueLimit: 10,
    filterValueIncrement: 10,
    hideEmptyFilterValues: true,
    localPagination: true
};

type AssetFilter = RemediationItemsFilter & ExposuresQueryFilter;

describe('FilterDefinitionsService Test Suite', () => {
    let service: FilterDefinitionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                FilterDefinitionsService,
                { provide: FiltersUtilityService, useValue: filterUtilityServiceMock },
                { provide: AlUrlFilterService, useClass:  UrlFilterServiceMock }
            ]
        });
        service = TestBed.get(FilterDefinitionsService);
        filterUtilityServiceMock.assetsList = {};
        filterUtilityServiceMock.extraAssetDetails = {};
    });

    describe('When building filter definitions', () => {
        describe('for a cardstack containing zero definitions', () => {
            let characteristics: AlCardstackViewCharacteristics;
            beforeEach(() => {
                characteristics = JSON.parse(JSON.stringify(mockCharacteristics));
            });
            describe('for a supplied deployment_type:aws HealthResponseFilter', () => {
                const mockFilters: AssetFilter[] = [{
                    type: 'deployment_type',
                    key: 'aws',
                    count: 3,
                    name: 'deployment_type'
                }];
                it('should behave create a new deployment_type definition', () => {
                    service.buildFilterDefinitions(mockFilters, characteristics);
                    expect(characteristics.definitions).toEqual({
                        deployment_type: {
                            property: "deployment_type",
                            caption: "Platform",
                            values: [{
                                property: 'deployment_type',
                                value: 'aws',
                                count: 3,
                                caption: 'AWS'
                            }],
                            metadata: {},
                            remote: true,
                            sortPositionIndex: 1
                        }
                    });
                });
            });
            describe('for a supplied subnet:/aws/bla HealthResponseFilter', () => {
                const mockFilters: AssetFilter[] = [{
                    type: 'subnet',
                    key: '/aws/bla',
                    count: 3,
                    name: 'subnet'
                }];
                it('should behave...', () => {
                    filterUtilityServiceMock.assetsList['subnet:/aws/bla'] = { name: 'subnet 1' };
                    service.buildFilterDefinitions(mockFilters, characteristics);
                    expect(characteristics.definitions).toEqual({
                        subnet: {
                            property: "subnet",
                            caption: "Subnet",
                            values: [{
                                property: 'subnet',
                                value: '/aws/bla',
                                count: 3,
                                caption: 'subnet 1'
                            }],
                            metadata: {},
                            remote: true
                        }
                    });
                });
            });
        });
        describe('for a cardstack containing a deployment_type definition for AWS deployments', () => {
            let characteristics: AlCardstackViewCharacteristics;
            beforeEach(() => {
                characteristics = JSON.parse(JSON.stringify(mockCharacteristics));
                characteristics.definitions = {
                    deployment_type: {
                        property: "deployment_type",
                        caption: "Platform",
                        values: [{
                            property: 'deployment_type',
                            value: 'aws',
                            count: 3,
                            caption: 'AWS',
                            captionPlural: 'AWS',
                            valueKey: 'deployment_type-aws'
                        }],
                        metadata: {},
                        remote: true,
                        sortPositionIndex: 1
                    }
                };
            });
            describe('for a supplied deployment_type:aws HealthResponseFilter', () => {
                const mockFilters: AssetFilter[] = [{
                    type: 'deployment_type',
                    key: 'aws',
                    count: 15,
                    name: 'deployment_type'
                }];
                it('should update the existing definition with the new count value returned for the filter', () => {
                    service.buildFilterDefinitions(mockFilters, characteristics);
                    expect(characteristics.definitions).toEqual({
                        deployment_type: {
                            property: "deployment_type",
                            caption: "Platform",
                            values: [{
                                property: 'deployment_type',
                                value: 'aws',
                                count: 15,
                                caption: 'AWS',
                                captionPlural: 'AWS',
                                valueKey: 'deployment_type-aws'
                            }],
                            metadata: {},
                            remote: true,
                            sortPositionIndex: 1
                        }
                    });
                });
            });
            describe('for a supplied HealthResponseFilters containing aws AND azure deployment_type filters', () => {
                const mockFilters: AssetFilter[] = [{
                    type: 'deployment_type',
                    key: 'aws',
                    count: 3,
                    name: 'deployment_type'
                },
                {
                    type: 'deployment_type',
                    key: 'azure',
                    count: 10,
                    name: 'deployment_type'
                }];
                it('should update the existing definition by adding a new value for Azure deployments and sort the values in count descending order', () => {
                    service.buildFilterDefinitions(mockFilters, characteristics);
                    expect(characteristics.definitions).toEqual({
                        deployment_type: {
                            property: "deployment_type",
                            caption: "Platform",
                            values: [{
                                property: 'deployment_type',
                                value: 'azure',
                                count: 10,
                                caption: 'Azure'
                            },{
                                property: 'deployment_type',
                                value: 'aws',
                                count: 3,
                                caption: 'AWS',
                                captionPlural: 'AWS',
                                valueKey: 'deployment_type-aws'
                            }],
                            metadata: {},
                            remote: true,
                            sortPositionIndex: 1
                        }
                    });
                });
            });
        });
        describe('for a supplied severity ExposuresQueryFilter', () => {
            let characteristics: AlCardstackViewCharacteristics;
            beforeEach(() => {
                characteristics = JSON.parse(JSON.stringify(mockCharacteristics));
            });
            it('should behave create a new deployment_type definition', () => {
                const filters: AssetFilter[] = [{
                    key: 'medium',
                    threat_level: 1,
                    threatiness: 5.031,
                    type: 'severity',
                    vinstances_count: 2,
                    name: 'severity',
                    count: 2
                }];
                service.buildFilterDefinitions(filters, characteristics);
                expect(characteristics.definitions).toEqual({
                    severity: {
                        property: "severity",
                        caption: "Severity",
                        values: [{
                            property: 'severity',
                            value: 'medium',
                            count: 2,
                            caption: 'Medium',
                            metadata: {
                                sortOrderIndex: 2
                            }
                        }],
                        metadata: {
                            overrideValueSortOrder: true
                        },
                        remote: true,
                        sortPositionIndex: 4
                    }
                });
            });
        });
        describe('for a filter name not present AppConstants.Filters.filterCaptions', () => {
            let characteristics: AlCardstackViewCharacteristics;
            beforeEach(() => {
                characteristics = JSON.parse(JSON.stringify(mockCharacteristics));
            });
            it('should fallback to using raw name and generate a usable filter for the UI', () => {
                const filters: AssetFilter[] = [{
                    key: 'any_value',
                    type: 'bla',
                    name: 'foo',
                    count: 2
                }];
                service.buildFilterDefinitions(filters, characteristics);
                expect(characteristics.definitions).toEqual({
                    bla: {
                        property: "bla",
                        caption: "bla",
                        values: [{
                            property: 'bla',
                            value: 'any_value',
                            count: 2,
                            caption: 'Any Value'
                        }],
                        metadata: {},
                        remote: true
                    }
                });
            });
        });
    });

    describe('When determining a filter value caption for a filter key', (() => {
        describe('that is a region identifier', () => {
            it('should return a converted value from the AssetTypeDictionary renderName function for a given type', () => {
                jest.spyOn(AssetTypeDictionary, 'getType').mockImplementation(() => { return {
                    type: null,
                    caption: 'bla',
                    topological: null,
                    renderName: () => { return 'CARDIFF-01'; }
                }});
                expect(service.determineFilterValueCaption('cardiff-01', 'region')).toEqual('CARDIFF-01');
            });
        });
        describe('present in the FilterUtilityService assetsList', () => {
            it('should find and return the right value', () => {
                filterUtilityServiceMock.assetsList['network'] = {
                    name: 'my-network'
                };
                expect(service.determineFilterValueCaption('network')).toEqual('my-network');
            });
        });
        describe('present in the FilterUtilityService extraAssetDetails', () => {
            it('should find and return the right value', () => {
                filterUtilityServiceMock.extraAssetDetails['policy-essentials'] = {
                    name: 'essentials'
                };
                expect(service.determineFilterValueCaption('policy-essentials')).toEqual('essentials');
            });
        });
        describe('present in commonValueCaptions of AppConstants.Filters', () => {
            it('should find and return the right value', () => {
                expect(service.determineFilterValueCaption('category:security')).toEqual('Security');
            });
        });
        describe('not present in any availble lookups', () => {
            describe('with a value of containing literal forward slashes', () => {
                it('should return the string part after the final slash in original string contained in parenthesis', () => {
                    expect(service.determineFilterValueCaption('foo/xyz-123')).toEqual('(xyz-123)');
                });
            });
            describe('with a value of containing no literal forward slashes', () => {
                it('should return the key value as is', () => {
                    expect(service.determineFilterValueCaption('xyz-123')).toEqual('xyz-123');
                });
            });
        });
    }));
    describe('When generating filter value definitions', () => {
        it('should correctly construct AlCardstackValueDescriptor instances', () => {
            expect(service.generateFilterValueDefinitions('foo', 'category', 'category:external')).toEqual([{
                property: 'category',
                value: 'foo',
                caption: 'External'
            } as AlCardstackValueDescriptor]);
        });
    });


    describe('when filterValuesToApply called ', () => {
        it('should return filters to apply', () => {
            let selectedFilters = ["deployment_id:7D5E66BE-98C6-40A2-8B09-5DC4C0FEE677", "category:security"];
            const results = service.filterValuesToApply(selectedFilters);
            expect(results.defs.deployment_id.caption).toEqual('Deployment');
            expect(results.filterValuesToApply[0].value).toEqual('7D5E66BE-98C6-40A2-8B09-5DC4C0FEE677');

        });
    });


    describe('when setFilterData called ', () => {
        it('should set the active filter ', () => {
            let selectedFilters = ["category:aws"];
            let exposuresfilters: ExposuresQueryFilter[] = [{
                key: "aws",
                threat_level: 3,
                threatiness: 8,
                type: "category",
                vinstances_count: 1
            },
            ];

            const filters = service.setFilterData(exposuresfilters, selectedFilters);
            expect(filters[1].caption).toEqual('Category');
            expect(filters[1].values[0].value).toEqual('aws');
            expect(filters[1].values[0].activeFilter).toBeTruthy();


        });
    });


    describe('when setReadOnlyFilter called ', () => {
        const remediationItem = {
            deployment_ids: ["F1A29B99-4B01-4C12-9337-1892F8268330"],
        } as RemediationItemAsset;

        const remediationFilter: RemediationItemsFilter[] = [
            {
                type: "deployment_id",
                name: "🧙DC ETE Tests (DO NOT DELETE)",
                key: "F1A29B99-4B01-4C12-9337-1892F8268330",
                count: 16
            }
        ];

        const deploymentsList: Deployment[] = [{
            id: "F1A29B99-4B01-4C12-9337-1892F8268330"
        }];
        it('should set the readOnly filter to show left-panel-details for dispose/conclude', () => {

            // tslint:disable-next-line: max-line-length
            jest.spyOn(filterUtilityServiceMock, 'createDeploymentDictionary').mockImplementation(() => filterUtilityServiceMock.assetsList = { "F1A29B99-4B01-4C12-9337-1892F8268330": { name: "🧙DC ETE Tests (DO NOT DELETE)", type: "datacenter" } });
            const readOnlyFilters = service.setReadOnlyFilter(remediationFilter, deploymentsList, remediationItem);

            expect(readOnlyFilters[0].title).toEqual("Deployment");
            expect(readOnlyFilters[0].elements[0].title).toEqual("🧙DC ETE Tests (DO NOT DELETE)");

        });
    });
});
