/**
 * @author Mario Payan <mario.payan@alertlogic.com>
 * @copyright 2019 Alert Logic, Inc.
 */

import { Component, Input, EventEmitter, Output, OnInit} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'al-help-sidebar',
    templateUrl: './al-help-sidebar.component.html',
    styleUrls: ['./al-help-sidebar.component.scss'],
    animations: [
        trigger('panelState', [
            state('hidden', style({
                opacity: 0
            })),
            state('visible', style({
                opacity: 1
            })),
            transition('visible => hidden', animate('300ms ease-in')),
            transition('hidden => visible', animate('300ms ease-out'))
        ])
    ]
})

export class AlHelpSidebarComponent implements OnInit {
    @Input() visible: boolean = false;
    @Input() iframeContentUrl: string = "";
    @Input() learnMoreUrl: string = "";
    @Output() onOpen: EventEmitter<void> = new EventEmitter();
    @Output() onClose: EventEmitter<void> = new EventEmitter();

    public iframeSafeResourceUrl: SafeResourceUrl = "";

    constructor(private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.safeUrl();
    }

    public safeUrl = (): void => {
        this.iframeSafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.iframeContentUrl);
    }

    public open = (): void => {
        this.visible = true;
        this.onOpen.emit();
    }

    public close = (): void => {
        this.visible = false;
        this.onClose.emit();
    }
}
