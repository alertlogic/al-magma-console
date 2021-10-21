import { Component, ViewEncapsulation, ViewChild } from '@angular/core';

/*
import { AlBetaGetStartedComponent } from '@al/ng-fancy-components';
*/

@Component({
    selector: 'overlays-carousel',
    templateUrl: './overlays-carousel.component.html',
    styleUrls: ['./overlays-carousel.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class OverlaysCarouselComponent {

    @ViewChild('tutorial', {static:false}) tutorial!: AlBetaGetStartedComponent;

    showTutorial() {
        this.tutorial.showTutorial();
    }
}
