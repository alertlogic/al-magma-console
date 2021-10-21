import { Component, OnInit } from '@angular/core';
import { MenuItem, SelectItem } from 'primeng/api';
import {ToggleButtonModule} from 'primeng/togglebutton';
import { AlToastMessage, AlToastService, AlSelectItem, AlActionSnackbarEvent, AlStateFilterDescriptor } from '@al/ng-generic-components';

@Component({
  selector: 'app-form-examples',
  templateUrl: './form-examples.component.html',
  styleUrls: ['./form-examples.component.scss']
})
export class FormExamplesComponent implements OnInit {
  country: any;

  filteredCountries: any[];

  brands: string[] = ['Audi', 'BMW', 'Fiat', 'Ford', 'Honda', 'Jaguar', 'Mercedes', 'Renault', 'Volvo', 'VW'];

  filteredBrands: any[];

  selectedBrands: string[];

  yesterday: Date = new Date();

  carOptions: SelectItem[];

  selectedMultiSelectCars: string[] = [];

  cities: SelectItem[];

  citiesListbox: SelectItem[];

  selectedCity1: any;

  selectedCity2: any;

  ratingValue: number;

  checkboxValues: string[] = [];

  radioValues: string[];

  switchChecked: boolean;

  rangeValues: number[] = [20, 80];

  toggleButtonChecked: boolean;

  types: SelectItem[];

  toggleIcons: SelectItem[];

  splitButtonItems: MenuItem[];

  radioValue: string;

  selectedType: string;

  color: string;

  checkboxes: AlSelectItem<any>[];

  selectedValues: any[] = [];
  selectedValues2: any[] = [];

  selectedItemMenu: AlSelectItem;

  stateFilters: {value:AlStateFilterDescriptor}[]= [
    { value:{ label:'Active', iconClass: 'material-icons', icon: 'check_circle', showTotal: true, total:15000 }},
    { value:{ label:'Inactive', iconClass: 'material-icons', icon: 'block', showTotal: true, totalShowing:12000000, total:1500 }},
    { value:{ label:'Deleted', iconClass: 'material-icons', icon: 'delete', showTotal: false }}
];
selectedState: AlStateFilterDescriptor  = this.stateFilters[0].value;

  constructor(private alToastService: AlToastService) {
    this.alToastService.getButtonEmitter('myToast').subscribe(
      (button:any) => {
        this.alToastService.clearMessages('myToast');
      }
    );
  }

  ngOnInit() {
    this.carOptions = [];
    this.carOptions.push({ label: 'Audi', value: 'Audi' });
    this.carOptions.push({ label: 'BMW', value: 'BMW' });
    this.carOptions.push({ label: 'Fiat', value: 'Fiat' });
    this.carOptions.push({ label: 'Ford', value: 'Ford' });
    this.carOptions.push({ label: 'Honda', value: 'Honda' });
    this.carOptions.push({ label: 'Jaguar', value: 'Jaguar' });
    this.carOptions.push({ label: 'Mercedes', value: 'Mercedes' });
    this.carOptions.push({ label: 'Renault', value: 'Renault' });
    this.carOptions.push({ label: 'VW', value: 'VW' });
    this.carOptions.push({ label: 'Volvo', value: 'Volvo' });

    this.cities = [];
    this.cities.push({ label: 'Select City', value: 0 });
    this.cities.push({ label: 'New York', value: { id: 1, name: 'New York', code: 'NY' } });
    this.cities.push({ label: 'Rome', value: { id: 2, name: 'Rome', code: 'RM' } });
    this.cities.push({ label: 'London', value: { id: 3, name: 'London', code: 'LDN' } });
    this.cities.push({ label: 'Istanbul', value: { id: 4, name: 'Istanbul', code: 'IST' } });
    this.cities.push({ label: 'Paris', value: { id: 5, name: 'Paris', code: 'PRS' } });

    this.citiesListbox = this.cities.slice(1);

    this.types = [];
    this.types.push({ label: 'Apartment', value: 'Apartment' });
    this.types.push({ label: 'House', value: 'House' });
    this.types.push({ label: 'Studio', value: 'Studio' });

    this.toggleIcons = [
      { label: 'Update', icon: 'ui-icon-update', value: "update" },
      { label: 'Delete', icon: 'ui-icon-close', value: "delete" },
      { label: 'Home', icon: 'ui-icon-home', value: "home" }
    ];

    this.splitButtonItems = [
      { label: 'Update', icon: 'ui-icon-update' },
      { label: 'Delete', icon: 'ui-icon-close' },
      { label: 'Home', icon: 'ui-icon-home' }
    ];

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

    this.selectedItemMenu = this.checkboxes[4].value;
    this.selectedValues = [].concat(this.checkboxes[1].value, this.checkboxes[2].value);
    this.selectedValues2 = [].concat(this.checkboxes[3].value, this.checkboxes[4].value);
  }

  filterCountry() {
    // const query = event.query;
    // this.countryService.getCountries().then(countries => {
    //     this.filteredCountries = this.searchCountry(query, countries);
    // });
  }

  searchCountry(query:any, countries: any[]): any[] {
    // in a real application, make a request to a remote url with the query and return filtered results,
    // for demo we filter at client side
    const filtered: any[] = [];
    for (const country of countries) {
      if (country.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(country);
      }
    }
    return filtered;
  }

  filterBrands(event:any) {
    this.filteredBrands = [];
    for (const brand of this.brands) {
      if (brand.toLowerCase().indexOf(event.query.toLowerCase()) === 0) {
        this.filteredBrands.push(brand);
      }
    }
  }

  selectOption (event:any) {
    console.log("Multiselect with list on selected options event example!", event);
  }

  handleACDropdownClick(event: Event) {
    this.filteredBrands = [];

    // mimic remote call
    setTimeout(() => {
      this.filteredBrands = this.brands;
    }, 100);
  }

  showAlToast(key: string) {
    switch (key) {
      case 'custom':
        const alToastMessage: AlToastMessage = {
          sticky: true,
          closable: false,
          data: {
            title: 'This is the title',
            message: 'This is a test message, here you can put whatever you want, choose wisely your words',
            iconClass: 'pi-exclamation-triangle',
            buttons: [
              {
                key: 'dont-show',
                label: 'don\'t show this message again',
                class: 'p-col secondaryButton',
                textAlign: 'left'
              },
              {
                key: 'close',
                label: 'not right now',
                class: 'p-col-fixed',
                textAlign: 'right'
              },
              {
                key: 'upgrade',
                label: 'hell yeah!',
                class: 'p-col-fixed',
                textAlign: 'right'
              }
            ]
          }
        };
        this.alToastService.showMessage('myToast', alToastMessage);
        break;
    }
  }

  clearAlToast() {
    this.alToastService.clearMessages('myToast');
  }

  snackBarAction(event:AlActionSnackbarEvent){
      alert("Action: " + event);
  }

  applyDateChange( date:Date[]){
    console.log("date: " + date);
  }

  addButtonClicked( button:string ){
      console.log("Button Clicked =>", button);
  }

  changeAlMultiselectList<T>(event: T[]){
    console.log(event);
  }

}
