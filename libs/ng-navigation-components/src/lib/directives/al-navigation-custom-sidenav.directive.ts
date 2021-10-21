
import { Directive, TemplateRef, Input, AfterViewInit } from '@angular/core';
import { AlNavigationService } from '../services/al-navigation.service';
import { AlNavigationSidenavMounted } from '../types/navigation.types';

@Directive({
    selector: '[alNavigationCustomSidenav]'
})
export class AlNavigationCustomSidenav implements AfterViewInit {

    @Input()
    contentRef:TemplateRef<any> | null = null;

    constructor(public alNavigation:AlNavigationService) {
    }

    ngAfterViewInit() {
        let event = new AlNavigationSidenavMounted( this.contentRef );
        this.alNavigation.events.trigger( event );
   }

}
