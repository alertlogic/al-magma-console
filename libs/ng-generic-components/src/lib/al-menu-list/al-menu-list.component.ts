import { Component, Input, EventEmitter, Output } from '@angular/core';
import { AlSelectItem } from '../types';

@Component({
    selector: 'al-menu-list',
    templateUrl: './al-menu-list.component.html',
    styleUrls: ['./al-menu-list.component.scss']
})
export class AlMenuListComponent {

    // Array with the items on the checkbox format (AlSelectItem from multi-select-list component)
    @Input() options:AlSelectItem[] = [];

    // Event Emitter with the selected options
    @Output() onItemSelected:EventEmitter<any> = new EventEmitter();

    @Input() selectedItem:AlSelectItem;

    onMenuItemClicked(event:any){
        this.onItemSelected.emit(event.value);
    }


}
