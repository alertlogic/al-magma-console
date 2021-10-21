import { Component, ViewEncapsulation } from '@angular/core';
import {MenuItem} from 'primeng/api';
@Component({
    selector: 'cards-dashboard-widgets',
    templateUrl: './cards-dashboard-widgets.component.html',
    styleUrls: ['./cards-dashboard-widgets.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class CardsDashboardWidgetsComponent {

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

    }
}
