import { AlSelectItem, AlActionSnackbarEvent } from '@al/ng-generic-components';
import {
    Component,
    ViewEncapsulation,
} from '@angular/core';
import {MenuItem} from 'primeng/api';

@Component({
    selector: 'forms-dropdown',
    templateUrl: './forms-dropdown.component.html',
    styleUrls: ['./forms-dropdown.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class FormsDropdownComponent {

    public multiselected?: AlSelectItem[];
    public mockOptions: AlSelectItem<any>[] = [
        // put copy/pasted list from spec.ts file here
        {
            title: "Peter Piper",
            subtitle: "(creator)",
            value: {
                title: "Peter Piper",
                subtitle: "(creator)",
                details: "Peter@piper.com",
                checked: false
            },
        },
        {
            title: "Billy Hoffman",
            subtitle: "",
            value: {
                title: "Billy Hoffman",
                details: "billy@hoffman.com",
                checked: false,
                id: '1'
            }
        },
        {
            title: "Brian Pearson",
            subtitle: "",
            value: {
                title: "Brian Pearson",
                details: "brian@pearson.com",
                checked: false
            }
        },
        {
            title: "Peter Griffin",
            subtitle: "",
            value: {
                title: "Peter Griffin",
                details: "Peter@griffin.com",
                checked: false,
                id: '2'
            }
        },
        {
            title: "Keanu Reeves",
            subtitle: "",
            value: {
                title: "Keanu Reeves",
                subtitle: "(Neo)",
                details: "kreeves@holywood.com",
                checked: false
            },
        },
    ];

    public dashboards = [
        { label: 'Threat Summary', icon: 'ui-icon-vertical-align-top', value: { id: 6, name: 'Threat Summmary', code: 'TS' } },
        { label: 'Coverage and Health', icon: 'ui-icon-vertical-align-top', value: { id: 1, name: 'Coverage and Health', code: 'CAH' } },
        { label: 'Vulnerability Summary', icon: 'ui-icon-vertical-align-top', value: { id: 2, name: 'Vulnerability Summary', code: 'VS' } }
    ];

    public cities: AlSelectItem[] = [
        { label: "New York", value: { id: 1, name: 'New York', code: "NY" } },
        { label: "Rome", value: { id: 2, name: 'Rome', code: "RM" } },
        { label: "London", value: { id: 3, name: 'London', code: "LDN" } },
        { label: "Istanbul", value: { id: 4, name: 'Istanbul', code: "IST" } },
        { label: "Paris", value: { id: 5, name: 'Paris', code: "PRS" } },
    ];
    public citiesAgain: AlSelectItem[] = [
        { title: "New York", subtitle: "this is my subtitle", value: { id: 1, name: 'New York', title: "New York", code: "NY" } },
        { title: "Rome", value: { id: 2, name: 'Rome', code: "RM" } },
        { title: "London", value: { id: 3, name: 'London', code: "LDN" } },
        { title: "Istanbul", value: { id: 4, name: 'Istanbul', code: "IST" } },
        { title: "Paris", value: { id: 5, name: 'Paris', code: "PRS" } },
    ];

    public selectedCity: AlSelectItem<{ id: number, name: string, code: string }> = this.cities[0].value;
    public selectedCity2: AlSelectItem<{ id: number, name: string, code: string }> = this.cities[0].value;

    public multiSelectOption(thing: AlSelectItem[]) {
        this.multiselected = thing;
    }

    yesterday: Date = new Date();

    checkboxes!: AlSelectItem<any>[];

    selectedValues: any[] = [];
    selectedValues2: any[] = [];

    items!: MenuItem[];

    ngOnInit() {

        this.items = [{
            label: 'File',
            items: [
                { label: 'New', icon: 'pi pi-fw pi-plus' },
                { label: 'Download', icon: 'pi pi-fw pi-download' }
            ]
        },
        {
            label: 'Edit',
            items: [
                { label: 'Add User', icon: 'pi pi-fw pi-user-plus' },
                { label: 'Remove User', icon: 'pi pi-fw pi-user-minus' }
            ]
        }];

        this.checkboxes = [
            {
                title: "Peter Piper",
                subtitle: "(creator)",
                value: {
                    title: "Peter Piper",
                    subtitle: "(creator)",
                    details: "Peter@piper.com",
                    checked: false,
                    value: "Peter Piper"
                },
            },
            {
                title: "Billy Hoffman",
                subtitle: "",
                value: {
                    title: "Billy Hoffman",
                    checked: false,
                    value: "Billy Hoffman"
                }
            },
            {
                title: "Brian Pearson",
                subtitle: "",
                value: {
                    title: "Brian Pearson",
                    checked: false,
                    value: "Brian Pearson"
                }
            },
            {
                title: "Peter Griffin",
                subtitle: "",
                value: {
                    title: "Peter Griffin",
                    checked: false,
                    value: "Peter Griffin"
                }
            },
            {
                title: "Keanu Reeves",
                subtitle: "(Neo)",
                value: {
                    title: "Keanu Reeves",
                    subtitle: "(Neo)",
                    details: "kreeves@holywood.com",
                    checked: false,
                    value: "Keanu Reeves"
                },
            },
            {
                title: "Peter Piper 2",
                subtitle: "(creator)",
                value: {
                    title: "Peter Piper 2",
                    subtitle: "(creator)",
                    details: "Peter@piper.com",
                    checked: false,
                    value: "Peter Piper 2"
                },
            },
            {
                title: "Billy Hoffman 2",
                subtitle: "",
                value: {
                    title: "Billy Hoffman 2",
                    checked: false,
                    value: "Billy Hoffman 2"
                }
            },
            {
                title: "Brian Pearson 2",
                subtitle: "",
                value: {
                    title: "Brian Pearson 2",
                    checked: false,
                    value: "Brian Pearson 2"
                }
            },
            {
                title: "Peter Griffin 2",
                subtitle: "",
                value: {
                    title: "Peter Griffin 2",
                    checked: false,
                    value: "Peter Griffin 2"
                }
            },
            {
                title: "Keanu Reeves 2",
                subtitle: "(Neo)",
                value: {
                    title: "Keanu Reeves 2",
                    subtitle: "(Neo)",
                    details: "kreeves@holywood.com",
                    checked: false,
                    value: "Keanu Reeves 2"
                },
            },
            {
                title: "Peter Piper 3",
                subtitle: "(creator)",
                value: {
                    title: "Peter Piper 3",
                    subtitle: "(creator)",
                    details: "Peter@piper.com",
                    checked: false,
                    value: "Peter Piper 3"
                },
            },
            {
                title: "Billy Hoffman 3",
                subtitle: "",
                value: {
                    title: "Billy Hoffman 3",
                    checked: false,
                    value: "Billy Hoffman 3"
                }
            },
            {
                title: "Brian Pearson 3",
                subtitle: "",
                value: {
                    title: "Brian Pearson 3",
                    checked: false,
                    value: "Brian Pearson 3"
                }
            },
            {
                title: "Peter Griffin 3",
                subtitle: "",
                value: {
                    title: "Peter Griffin 3",
                    checked: false,
                    value: "Peter Griffin 3"
                }
            },
            {
                title: "Keanu Reeves 3",
                subtitle: "(Neo)",
                value: {
                    title: "Keanu Reeves 3",
                    subtitle: "(Neo)",
                    details: "kreeves@holywood.com",
                    checked: false,
                    value: "Keanu Reeves 3"
                },
            },
            {
                title: "Peter Piper 4",
                subtitle: "(creator)",
                value: {
                    title: "Peter Piper 4",
                    subtitle: "(creator)",
                    details: "Peter@piper.com",
                    checked: false,
                    value: "Peter Piper 4"
                },
            },
            {
                title: "Billy Hoffman 4",
                subtitle: "",
                value: {
                    title: "Billy Hoffman 4",
                    checked: false,
                    value: "Billy Hoffman 4"
                }
            },
            {
                title: "Brian Pearson 4",
                subtitle: "",
                value: {
                    title: "Brian Pearson 4",
                    checked: false,
                    value: "Brian Pearson 4"
                }
            },
            {
                title: "Peter Griffin 4",
                subtitle: "",
                value: {
                    title: "Peter Griffin 4",
                    checked: false,
                    value: "Peter Griffin 4"
                }
            },
            {
                title: "Keanu Reeves 4",
                subtitle: "(Neo)",
                value: {
                    title: "Keanu Reeves 4",
                    subtitle: "(Neo)",
                    details: "kreeves@holywood.com",
                    checked: false,
                    value: "Keanu Reeves 4"
                },
            },
        ];
    }

    selectOption(event: any) {
        console.log("Multiselect with list on selected options event example!", event);
    }

    snackBarAction(event: AlActionSnackbarEvent) {
        alert("Action: " + event);
    }

    applyDateChange(date: Date[]) {
        console.log("date: " + date);
    }

    addButtonClicked(button: string) {
        console.log("Button Clicked =>", button);
    }

    changeAlMultiselectList<T>(event: T[]) {
        console.log(event);
    }
}