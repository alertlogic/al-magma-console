import { AlOptionItem } from '../../../types/al-common.types';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ald-tree-view-item',
  templateUrl: './al-tree-view-item.component.html'
})
export class AlTreeViewItemComponent  {

  @Input() item: AlOptionItem;
  @Input() level: number = 1;
  @Input() nested: boolean = false;
  @Output() didItemCheckedChange: EventEmitter<{checked: boolean, item: AlOptionItem}> = new EventEmitter();

  levelsLimit = 5; // maximum number of supported levels - due to the supported CSS limits.
  expanded: boolean = false;

  /**
   * Toggles the row to expand collapse nested items.
   */
  toggleRow() {
    this.expanded = !this.expanded;
  }

  /**
   * Checking an item sets its checkbox to true/false, then if nested, will check/uncheck it's child items.
   * @param checked is checked
   * @param item The checked/ unchecked item.
   */
  checkedItem(checked: boolean, item: AlOptionItem) {
    item.selected = checked;

    // Prevent any further selecting and emitting of subitems if nested is not true.
    if (!this.nested) { return; }

    function selectSubItem(item) {
      if (item.items) {
        item.items.forEach(subitem => {
          subitem.selected = checked;
          selectSubItem(subitem);
        });
      }
    }

    selectSubItem(item);

    this.didItemCheckedChange.emit({checked, item});
  }

  /**
   * Passes a child's checked state back up to the parent
   * @param checked is checked
   * @param item is the item
   */
  checkedChanged(checked: boolean, item: AlOptionItem) {

    let isIndeterminate = false;

    item.items.forEach(element => {
      if (element.selected || element.indeterminate) {
        isIndeterminate = true;
      }
    });

    item.indeterminate = isIndeterminate;

    this.didItemCheckedChange.emit({checked, item});
  }

}
