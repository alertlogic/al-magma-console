
import { Directive, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { AlNavigationService } from '../services/al-navigation.service';
import { AlAddendumToNavTitleEvent } from '../types/navigation.types';

@Directive({
    selector: '[alAddendumToNavTitle]'
})
export class AlAddendumToNavTitle implements OnDestroy, OnChanges {

    @Input('alAddendumToNavTitle') navTitle: string;

    constructor(public alNavigation: AlNavigationService) {
    }

    ngOnDestroy() {
        let event = new AlAddendumToNavTitleEvent("");
        this.alNavigation.events.trigger(event);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty("navTitle")) {
            let event = new AlAddendumToNavTitleEvent(this.navTitle);
            this.alNavigation.events.trigger(event);
        }
    }

}
