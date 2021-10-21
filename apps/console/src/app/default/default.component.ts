import { Component } from '@angular/core';
import { AlNavigationService } from '@al/ng-navigation-components';

@Component({
  selector: 'al-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent {

    constructor( public navigation:AlNavigationService ) {
        console.log("Yay!" );

    }
}
