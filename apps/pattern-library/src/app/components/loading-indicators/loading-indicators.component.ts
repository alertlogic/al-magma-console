import { Component, ViewChild } from '@angular/core';
import { AlViewHelperComponent } from '@al/ng-generic-components';

@Component({
  selector: 'al-loading-indicators',
  templateUrl: './loading-indicators.component.html',
  styleUrls: ['./loading-indicators.component.scss']
})
export class LoadingIndicatorsComponent  {

  @ViewChild(AlViewHelperComponent, {static:false}) viewHelper!:AlViewHelperComponent;

}
