import { Component, Input, } from '@angular/core';

@Component({
  selector: 'ald-table-cell-date',
  templateUrl: './table-cell-date.component.html'
})
export class AlTableCellDateComponent {

    @Input() value: string;


}
