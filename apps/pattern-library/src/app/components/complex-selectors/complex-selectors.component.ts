import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { AlSelectItem } from '@al/ng-generic-components';

@Component({
  selector: 'app-complex-selectors',
  templateUrl: './complex-selectors.component.html',
  styleUrls: ['./complex-selectors.component.scss']
})
export class ComplexSelectorsComponent implements OnInit {
  
  checkboxValues: string[] = [];

  types: SelectItem[];

  selectedType: string;

  checkboxes: AlSelectItem<any>[];

  selectedValues: any[] = [];

  selectedItemMenu: AlSelectItem;

  ngOnInit() {
    this.checkboxes = [
        {
            title: "Peter Piper",
            subtitle: "(creator)",
            value: {
                title: "Peter Piper",
                subtitle: "(creator)",
                details: "Peter@piper.com",
                checked: true,
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
    ];

    this.selectedItemMenu = this.checkboxes[4].value;

  }

  selectOption (event:any) {
    console.log("Multiselect with list on selected options event example!", event);
  }

  changeAlMultiselectList<T>(event: T[]){
    console.log(event);
  }

}

