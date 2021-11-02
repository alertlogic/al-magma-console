import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ald-layout-col',
  templateUrl: './al-layout-col.component.html',
  styleUrls: ['./al-layout-col.component.scss']
})
export class AlLayoutColComponent {

  @Input() scrollable: boolean;
  @Input() fixedWidth: boolean;

  @HostBinding('class') class = 'ald-layout-col';

  @HostBinding('class.ald-layout-col--fixed-width') get getFixed() {
    return this.fixedWidth;
  }

  constructor() { }

}
