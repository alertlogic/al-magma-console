import { AlExposureDisposeComponent } from '@al/ng-asset-components';
import { Component } from '@angular/core';

@Component({
  selector: 'al-exposure-dispose',
  template: '',
  providers: [
    {
      provide: AlExposureDisposeComponent,
      useClass: AlExposureDisposeMockComponent
    }
  ]
})
export class AlExposureDisposeMockComponent {
    public rightDrawer = {
        open: () => {},
        close: () => {}
    };
}
