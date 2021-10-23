import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ald-tab',
  templateUrl: './al-tab.component.html'
})
export class AlTabComponent {

  @Input() name: string;
  active = false;

  @HostBinding('class.u-display-block') get tabActive(){
    return this.active;
  }

  @HostBinding('class.u-display-none') get tabInactive(){
    return !this.active;
  }


}
