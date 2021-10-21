import { Component, ViewEncapsulation } from '@angular/core';
import { MenuItem} from 'primeng/api';

@Component({
    selector: 'split-dropdown',
    templateUrl: './split-dropdown.component.html',
    styleUrls: ['./split-dropdown.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class SplitDropdownComponent {

    splitButtonItems: MenuItem[];


    ngOnInit() {
        this.splitButtonItems = [
            { label: 'Update'},
            { label: 'Delete'} ,
            { label: 'Home'}
        ];
    }
}

