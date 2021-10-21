import { AlExposureConcludeComponent } from '@al/ng-asset-components';
import { Component } from '@angular/core';

@Component({
  selector: 'al-exposure-conclude',
  template: '',
  providers: [
    {
      provide: AlExposureConcludeComponent,
      useClass: AlExposureConcludeMockComponent
    }
  ]
})
export class AlExposureConcludeMockComponent {
    public rightDrawer = {
        open: () => {},
        close: () => {}
    };
}
