import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'panels',
    templateUrl: './panels.component.html',
    styleUrls: ['./panels.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class PanelsComponent {

    items: any;
    update: any;
    delete: any;

    
    ngOnInit() {
        this.items = [
            {
                label: 'Options',
                items: [{
                    label: 'Update',
                    icon: 'pi pi-refresh',
                    command: () => {
                        this.update();
                    }
                },
                {
                    label: 'Delete',
                    icon: 'pi pi-times',
                    command: () => {
                        this.delete();
                    }
                }
            ]},
            {
                label: 'Navigate',
                items: [{
                    label: 'Angular Website',
                    icon: 'pi pi-external-link',
                    url: 'http://angular.io'
                },
                {
                    label: 'Router',
                    icon: 'pi pi-upload',
                    routerLink: '/fileupload'
                }
            ]}
        ];
    }
}
