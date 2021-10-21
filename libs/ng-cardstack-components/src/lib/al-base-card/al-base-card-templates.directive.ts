import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[alBaseCardHeader]'
})
export class AlBaseCardHeaderTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[alBaseCardIcon]'
})
export class AlBaseCardIconTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[alBaseCardTitle]'
})
export class AlBaseCardTitleTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[alBaseCardCaption]'
})
export class AlBaseCardCaptionTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}


@Directive({
    selector: '[alBaseCardContent]'
})
export class AlBaseCardContentTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[alBaseCardSubtitle]'
})
export class AlBaseCardSubtitleTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[alBaseCardHeaderRight]'
})

export class AlBaseCardHeaderRightTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[alBaseCardBodyContent]'
})

export class AlBaseCardBodyContentTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[alBaseCardFooter]'
})

export class AlBaseCardFooterTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[alBaseCardHeaderExtraContent]'
})

export class AlBaseCardHeaderExtraContentTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

