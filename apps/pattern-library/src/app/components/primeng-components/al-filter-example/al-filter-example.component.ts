import { AlFilterDescriptor, AlUiFilterValue, AlUiFilter } from '@al/ng-generic-components';
import { Component } from '@angular/core';
import { AlCardstackValueDescriptor } from '@al/core';

@Component({
    selector: 'app-filter-example',
    templateUrl: './al-filter-example.component.html',
    styleUrls: ['./al-filter-example.component.scss']
})
export class AlFilterExampleComponent {

    public cardStackFiltersConfig: AlFilterDescriptor = {
        filterValueIncrement: 1,
        filterValueLimit: 1,
        hideEmptyFilterValues: true,
        showToolTip: true,
        toolTipText: "Exposure Instances"
    }

    public cardStackFiltersConfigforPopover: AlFilterDescriptor = {
        filterValueIncrement: 1,
        filterValueLimit: 100,
        hideEmptyFilterValues: false,
        showMoreType: 'popover',
        highlight: true,
        activeIcon: true,
        showMoreNoActive: true
    }

    public cardStackFiltersConfigforAccordion: AlFilterDescriptor = {
        filterValueIncrement: 1,
        filterValueLimit: 100,
        hideEmptyFilterValues: false,
        showMoreType: 'accordion',
        highlight: true,
        activeIcon: true,
        showMoreNoActive: true,
        showMoreZeros: true,
    }

    public filters: AlUiFilter[] = [
        {
            property: 'severity',
            caption: 'severity',
            shown: 1,
            values: [
                {
                    property: "low",
                    caption: 'Low',
                    value: 'Low',
                    count: 0,
                    default: false,
                    captionPlural: "Low",
                    valueKey: "Low",
                    metadata: {
                        borderLeft: 'low'
                    }
                },
                {
                    property: "Medium",
                    caption: 'Medium',
                    value: 'Medium',
                    count: 73669,
                    total: 100,
                    default: false,
                    captionPlural: "Medium",
                    valueKey: "Medium",
                    metadata: {
                        borderLeft: 'medium'
                    }
                },
                {
                    property: "high",
                    caption: 'High',
                    value: 'High',
                    count: 78669,
                    default: false,
                    captionPlural: "High",
                    valueKey: "High",
                    metadata: {
                        borderLeft: 'high'
                    }
                },
                {
                    property: "Critical",
                    caption: 'Critical',
                    default: false,
                    captionPlural: "Critical",
                    valueKey: "Critical",
                    value: "Critical",
                    count: 73669,
                    metadata: {
                        borderLeft: 'critical'
                    }
                },
            ],
            metadata: {}
        },
        {
            property: 'pci_severity',
            caption: 'PCI ',
            shown: 1,
            values: [
                {

                    property: "pass",
                    value: "Pass",
                    caption: "Pass",
                    captionPlural: "Pass",
                    valueKey: "Pass",
                    default: false,
                    metadata: {
                        borderLeft: 'info'
                    }
                },
                {
                    property: "fail",
                    value: "Fail",
                    caption: "Fail",
                    captionPlural: "Fail",
                    valueKey: "Fail",
                    default: false,
                    metadata: {
                        borderLeft: 'critical'
                    }
                }
            ],
            metadata: {}
        },
        {
            property: 'deployments',
            caption: 'Deployments ',
            shown: 1,
            values: [],
            metadata: {},
            children:[
                {
                    property: "deployment_account",
                    shown: 100,
                    caption: "SRE 1",
                    metadata: {},
                    values: [{
                        property: "production_1",
                        value: "production_1",
                        caption: "Production 1",
                        captionPlural: "Production 1",
                        valueKey: "production_1",
                        default: false,
                        count: 15,
                        metadata: {
                            borderLeft: 'high'
                        }
                    },
                    {
                        property: "development_1",
                        value: "development_1",
                        caption: "Development 1",
                        captionPlural: "Development 1",
                        valueKey: "development_1",
                        default: false,
                        count: 18,
                        metadata: {
                            borderLeft: 'info'
                        }
                    }]
                },
                {
                    property: "deployment_account",
                    caption: "SRE 2",
                    shown: 100,
                    metadata: {},
                    values: [{
                        property: "production_2",
                        value: "production_2",
                        caption: "Production 2",
                        captionPlural: "Production 2",
                        valueKey: "production_2",
                        default: false,
                        count: 10,
                        metadata: {
                            borderLeft: 'medium'
                        }
                    },
                    {
                        property: "intergation",
                        value: "intergation",
                        caption: "Integration",
                        captionPlural: "Integration",
                        valueKey: "intergation",
                        default: false,
                        count: 11,
                        metadata: {
                            borderLeft: 'critical'
                        }
                    }]
                }
            ]
        }
    ];



    constructor() { }


    public setActiveFilter(filter: AlUiFilterValue, type: string) {
        this.toogleFilter(filter);
    }

    public clearAllFilters(type: string) {
        let filters = this.filters;
        filters.forEach(filter => {
            const auxFn = (values: AlCardstackValueDescriptor[]) => {
                values.forEach(value => {
                    value.activeFilter = false;
                });
            };
            if(filter.children){
                filter.children?.forEach(f => {
                    auxFn(f.values);
                    f.activeFilter = false;
                });
            } else if(filter.values){
                auxFn(filter.values);
            }
            filter.activeFilter = false;
        });
        this.filters = [...filters];
    }

    public removeFilterBy(vDescriptor: AlCardstackValueDescriptor, type: string) {
        let filters = this.filters;
        filters.forEach(filter => {
            const recursive = (filters: any) => {
                let active = false;
                filters.forEach((value: any) => {
                    if(value.children && value.children.length) {
                        recursive(value.children);
                    }
    
                    if (value.property === vDescriptor.property) {
                        value.activeFilter = false;
                        active = true;
                    }

                    if (active) {
                        filter.activeFilter = false;
                    }
                });
            }
            recursive(filter.values);
        });
        this.filters = [...filters];
    }

    public toogleFilter(vDescriptor: AlCardstackValueDescriptor) {
        const auxFn = (values: AlCardstackValueDescriptor[]) => {
            for (let i = 0; i < values.length; i++) {
                const f = values[i];
                if (f.property === vDescriptor.property) {
                    f.activeFilter = !vDescriptor.activeFilter;
                    return f.activeFilter;
                }
            }
            return values.some((v) => v.activeFilter);
        }

        this.filters.forEach(filter => {
            // just for deep filters
            if(filter.children){
                filter.children.forEach((f) => {
                    f.activeFilter = auxFn(f.values);
                    if(f.activeFilter) {
                        filter.activeFilter = true;
                    }
                });
            }
            if(filter.values) {
                filter.activeFilter = auxFn(filter.values)
            }
        });
        this.filters = [...this.filters];
    }
}
