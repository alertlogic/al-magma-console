import { Component, Input } from '@angular/core';

enum WrapperDensity {
  comfortable = 'comfortable',
  compact = 'compact'
}

@Component({
  selector: 'ald-wrapper',
  templateUrl: './al-wrapper.component.html',
  styleUrls: ['./al-wrapper.component.scss']
})
export class AlWrapperComponent {

  @Input() density?: WrapperDensity;

  constructor() { }

}
