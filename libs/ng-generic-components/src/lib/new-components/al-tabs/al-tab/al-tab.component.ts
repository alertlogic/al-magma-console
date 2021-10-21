import { Component, Input } from '@angular/core';

@Component({
  selector: 'al2-tab',
  templateUrl: './al-tab.component.html'
})
export class AlTabComponent {

  @Input() name: string;
  active = false;


}
