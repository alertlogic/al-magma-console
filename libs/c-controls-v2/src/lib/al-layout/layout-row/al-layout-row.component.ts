import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ald-layout-row',
  templateUrl: './al-layout-row.component.html',
  styleUrls: ['./al-layout-row.component.scss']
})
export class AlLayoutRowComponent {

  @Input() scrollable: boolean;
  @Input() flexRow: boolean;

  @HostBinding('class') class = 'ald-layout-row';

  @HostBinding('class.u-overflow-auto') get getScrollable() {
    return this.scrollable;
  }

  @HostBinding('class.ald-layout-row--with-cols') get getFlexRow() {
    return this.flexRow;
  }

  constructor() { }

}
