/**
 * Extension of the component Sidebar of the primeng.
 * @author Andres Echeverri <andres.echeverri@alertlogic.com>
 * @copyright 2019 Alert Logic, Inc.
 */

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ContentChild, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ChangeDetectorRef } from '@angular/core';
import { Sidebar } from 'primeng/sidebar';
import { AlHeaderTemplateDirective } from './al-header-template.directive';
import { AlBottomSheetHeaderOptions } from './al-bottom-sheet-header-options.types';
import { DomHandler } from 'primeng/dom';
import { PrimeNGConfig } from 'primeng/api';
import { AlFooterTemplateDirective } from './al-footer-template.directive';
import { AlBottomSheetFooterOptions } from './al-bottom-sheet-footer-options.types';

@Component({
    selector: 'al-bottom-sheet',
    templateUrl: './al-bottom-sheet.component.html',
    styleUrls: ['./al-bottom-sheet.component.scss'],
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
export class AlBottomSheetComponent<T = any> extends Sidebar implements OnInit {

    /**
     * Allows define the width of the al-bottom-sheet.
     * The values can be in px, %, vh, rem etc...
     */
    @Input() width: string = '95%';
    // Allows to set the heigth of the sidebar when the sidebar is collapse
    @Input() heightActive: string = '67px';
    // Allows to set the heigth of the sidebar when the sidebar is open
    @Input() heightFullScreen: string = '95vh';
    @Input() allowContent: boolean = true;
    // Allows establish options for header (default template)
    @Input() headerOptions: AlBottomSheetHeaderOptions;
    // Allows establish options for footer (default template)
    @Input() footerOptions: AlBottomSheetFooterOptions;
    // The target object
    @Input() target: T | undefined;
    @Input() loading: boolean = false;
    // Emit an event when user clicks on Primary buttom of header
    @Output() onPrimaryAction = new EventEmitter<T>();
    // Emit an event when user clicks on Secondary buttom of header
    @Output() onSecondaryAction = new EventEmitter<T>();
    // Emit an event when user clicks on tertiary buttom of header
    @Output() onTertiaryAction = new EventEmitter<T>();
    @Output() onPrimaryFooterAction = new EventEmitter<T>();
    @Output() onSecondaryFooterAction = new EventEmitter<T>();
    @Output() onOpen = new EventEmitter();

    // Allows a custom header <ng-template headerTemplate></ng-template>
    @ContentChild(AlHeaderTemplateDirective, {static:true}) headerTemplate: AlHeaderTemplateDirective;

    // Allows a custom footer options <ng-template footerTemplate></ng-template>
    @ContentChild(AlFooterTemplateDirective, {static:true}) footerTemplate: AlFooterTemplateDirective;

    public state: 'opened' | 'closed' | 'collapsed' = 'closed';

    constructor(
        public el: ElementRef,
        public renderer: Renderer2,
        public cd: ChangeDetectorRef,
        public config: PrimeNGConfig
    ) {
        super(el, renderer, cd, config);
    }

    ngOnInit(): void {
        this.defaultConfig();
        this.setBottomWidth();
    }

    /**
     * Public method to open the bottom sheet
     */
    public open(target?: T | undefined): void {
        this.state = 'opened';
        this.target = target;
        this.visible = true;
        this.fullScreen = true;
        this.setStyleSidebar('overflow-y', 'auto');
        this.setStyleSidebar('height', this.heightFullScreen);
        this.enableModality();
        // add custom class for mask
        DomHandler.addClass(this.mask, 'al-bottom-sheet-mask');
        this.onOpen.emit();
    }

    /**
     * Public method to collapse the bottom sheet
     */
    public collapse(): void {
        this.state = 'collapsed';
        this.visible = true;
        this.fullScreen = false;
        this.setStyleSidebar('overflow-y', 'hidden');
        this.setStyleSidebar('height', this.heightActive);
        this.disableModality();
    }

    /**
     * Override hide method of Sidebar
     * Public method to close the bottom sheet
     */
    public hide(): void {
        // avoid infine loop
        if(this.visible) {
            this.visible = false;
        }
        this.state = 'closed';
        this.fullScreen = false;
        this.disableModality();
    }

    /**
     * Public method allow collapse and show the bottom-sheet
     */
    public toggle(blAllowToggle: boolean = true) {
        if(blAllowToggle) {
            if (this.visible && this.fullScreen) {
                this.collapse();
            } else {
                this.open(this.target);
            }
        }
    }

    /**
     * Set default config for p-sidebar
     */
    private defaultConfig() {
        this.appendTo = document.getElementById( 'body' );
        this.dismissible = false;
        this.blockScroll = true;
        this.showCloseIcon = false;
    }

    /**
     * Center the bottom sheet
     */
    private setBottomWidth(): void {
        // centering horizontally
        this.setStyleSidebar('width', this.width);
        const unit = this.width.replace(/[0-9.]/g, '');
        const width = parseFloat(this.width);
        this.setStyleSidebar('margin-left', `-${(width / 2)}${unit}`);
    }

    /**
     * Set styles of the sidebar
     * @param property is a property of css (height, width, margin, etc....)
     * @param value the value of the porpety
     */
    private setStyleSidebar(property: string, value: string): void {
        /**
         * Original code does not compile in ng11:
        const elm = this.el.nativeElement.firstChild ? this.el.nativeElement.firstChild : this.containerViewChild.nativeElement;
        this.renderer.setStyle(elm, property, value);
        */
        if ( this.el.nativeElement.firstChild ) {
            this.renderer.setStyle(this.el.nativeElement.firstChild, property, value);
        }
    }

}
