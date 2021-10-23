import { Component, Input, } from '@angular/core';

@Component({
  selector: 'ald-table-cell-ip-address',
  templateUrl: './table-cell-ip-address.component.html'
})
export class AlTableCellIpAddressComponent {

  @Input() value: string;

}
