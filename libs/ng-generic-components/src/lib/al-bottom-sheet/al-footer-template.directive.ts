import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[alFooterTemplate]'
})
export class AlFooterTemplateDirective {
    constructor(public templateRef: TemplateRef<any>) { }
}
