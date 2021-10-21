import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'progress-indicators',
    templateUrl: './progress-indicators.component.html',
    styleUrls: ['./progress-indicators.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class ProgressIndicatorsComponent {
    value: number = 0;

    ngOnInit() {
        let interval = setInterval(() => {
            this.value = this.value + Math.floor(Math.random() * 10) + 1;
            if (this.value >= 100) {
                this.value = 100;
                clearInterval(interval);
            }
        }, 2000);
    }
}
