import { Component, Input } from '@angular/core';

@Component({
  selector: 'ald-table-cell-link',
  templateUrl: './table-cell-link.component.html'
})
export class AlTableCellLinkComponent {
  
  @Input() value: string;
  @Input() path: string;
  @Input() key: string;
  
}
