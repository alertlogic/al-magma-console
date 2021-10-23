import { Component, Input } from '@angular/core';

@Component({
  selector: 'ald-table-cell-boolean',
  templateUrl: './table-cell-boolean.component.html'
})
export class AlTableCellBooleanComponent {

    @Input() value: boolean;

}
