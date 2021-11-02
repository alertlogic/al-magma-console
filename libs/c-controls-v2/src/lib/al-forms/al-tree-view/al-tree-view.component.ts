import { AlOptionItem } from '../../types/al-common.types';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ald-tree-view',
  templateUrl: './al-tree-view.component.html'
})
export class AlTreeViewComponent {

  @Input() options: AlOptionItem[] = [];
  @Input() nested: boolean = false;
  @Output() didChange: EventEmitter<any> = new EventEmitter();

  checkedChanged(event: {checked: boolean, item: AlOptionItem}, item) {
    item.selected = event.checked;
    this.didChange.emit(event);
  }

  /*
  * Clears all selected checkboxes
  */
  clearSelection() {
    function unselectItems(items) {
      items.forEach(item => {
        item.selected = false;

        if (item.items) {
          unselectItems(item.items);
        }
      });
    }

    unselectItems(this.options);
  }

}
