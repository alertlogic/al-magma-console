
import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Directive({
    selector: '[alCustomTitle]'
})
export class AlCustomTitleDirective implements OnChanges {

    @Input('alCustomTitle') titles: string|string[];

    constructor(private titleService: Title ) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty("titles")) {

            /* Description.
            *
            * If the TAB title ONLY has one item this MUST be assigned as String.
            * BUT, If it has two or more items we need to assign the variables as an Array.
            */
            if( typeof this.titles === "string" ) {
                this.titleService.setTitle( this.titles );
            } else {
                let tabTitle:string = this.titles.join(" | " );
                this.titleService.setTitle( tabTitle );
            }
        }
    }

}
