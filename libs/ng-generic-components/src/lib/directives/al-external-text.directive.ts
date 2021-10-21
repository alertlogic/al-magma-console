import { Directive, Input, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { AlExternalContentManagerService } from '../services';

@Directive({
    selector: '[alExternalText]',
})
export class AlExternalTextDirective implements OnChanges {

    @Input( 'alExternalText' ) resource?:string;

    constructor( public externalContent: AlExternalContentManagerService,
                 public elementRef: ElementRef ) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty("resource") && this.resource ) {
            this.installResourceText( this.resource );
        }
    }

    public async installResourceText( resourceId: string ) {
        const resourceText = await this.externalContent.getTextResource( resourceId );
        this.elementRef.nativeElement.innerText = resourceText;
    }
}
