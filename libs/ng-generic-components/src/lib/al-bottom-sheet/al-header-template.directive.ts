import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[alHeaderTemplate]'
})
export class AlHeaderTemplateDirective {
    constructor(public templateRef: TemplateRef<any>) { }
}
