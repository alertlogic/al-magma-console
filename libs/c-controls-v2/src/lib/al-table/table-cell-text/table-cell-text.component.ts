import { Component, Input, } from '@angular/core';

@Component({
  selector: 'ald-table-cell-text',
  templateUrl: './table-cell-text.component.html'
})
export class AlTableCellTextComponent {

    @Input() value: string;


}
