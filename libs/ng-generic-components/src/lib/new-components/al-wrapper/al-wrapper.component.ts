import { Component, Input } from '@angular/core';

enum WrapperDensity {
  comfortable = 'comfortable',
  compact = 'compact'
}

@Component({
  selector: 'al2-wrapper',
  templateUrl: './al-wrapper.component.html'
})
export class AlWrapperComponent {

  @Input() density?: WrapperDensity;

  constructor() { }

}
