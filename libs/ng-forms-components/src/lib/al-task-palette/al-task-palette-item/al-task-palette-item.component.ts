
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlTaskPaletteItem } from '../../types/playbook-action';

@Component({
    selector: 'al-task-palette-item',
    templateUrl: './al-task-palette-item.component.html',
    styleUrls: ['./al-task-palette-item.component.scss']
})
export class AlTaskPaletteItemComponent {

    @Input() item: AlTaskPaletteItem;
    @Input() removeable = false;
    @Input() hasError = false;
    @Input() errorTooltipMessage = '';

    @Output() onRemoveClick: EventEmitter<AlTaskPaletteItem> = new EventEmitter<AlTaskPaletteItem>();

    removeActionClick(item: AlTaskPaletteItem) {
        this.item = item;
        this.onRemoveClick.emit(this.item);
    }
}
