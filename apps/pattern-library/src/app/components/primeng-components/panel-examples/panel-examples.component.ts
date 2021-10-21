import {Component, OnInit} from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
    templateUrl: './panel-examples.component.html',
    styles: [`
        :host ::ng-deep button {
            margin-right: .25em;
        }
    `]
})
export class PanelExamplesComponent implements OnInit {

    items: MenuItem[];

    ngOnInit() {
        this.items = [
            {label: 'Angular.io', icon: 'ui-icon-link', url: 'http://angular.io'},
            {label: 'Theming', icon: 'ui-icon-brush', routerLink: ['/theming']}
        ];
    }
}
