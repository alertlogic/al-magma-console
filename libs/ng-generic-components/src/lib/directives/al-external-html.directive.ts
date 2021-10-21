import { Directive, Input, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { AlExternalContentManagerService } from '../services';

@Directive({
    selector: '[alExternalHtml]'
})
export class AlExternalHtmlDirective implements OnChanges {

    @Input( 'alExternalHtml' ) resource?:string;
    @Input( 'transformer' ) transformer?:{(html:string):string|PromiseLike<string>};

    constructor( public externalContent: AlExternalContentManagerService,
                 public elementRef: ElementRef ) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty("resource") && this.resource ) {
            this.installResourceMarkup( this.resource );
        }
    }

    public async installResourceMarkup( resourceId:string ) {
        const safeHtml = await this.externalContent.getHtmlResource( resourceId, undefined, this.transformer );
        //  A note: the following trick exploits the structure of SafeHtml in a way that is probably not future proof.
        this.elementRef.nativeElement.innerHTML = Object.values( safeHtml ).shift() || "";
    }
}
