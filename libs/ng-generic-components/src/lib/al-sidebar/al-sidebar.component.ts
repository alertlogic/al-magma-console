/**
 * @author Mohasin Nadaf <mohasin.nadaf@alertlogic.com>
 * @copyright 2020 Alert Logic, Inc.
 */

import { Component, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AlSidebarConfig } from '../types/al-sidebar.types';
import { AlViewHelperComponent } from '../al-view-helper/al-view-helper.component';
import { AlNotificationType } from '../types/al-notification-panel.types';
import { Sidebar } from 'primeng/sidebar';

@Component({
    selector: 'al-sidebar',
    templateUrl: './al-sidebar.component.html',
    styleUrls: ['./al-sidebar.component.scss'],
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
export class AlSidebarComponent {

    @Input() visible: boolean = false;
    @Input() expanded: boolean = false;
    @Input() config: AlSidebarConfig;

    @ViewChild("viewHelper", { static: false }) helper!: AlViewHelperComponent;
    @ViewChild("pSidebar", { static: false }) pSideBar!: Sidebar;

    @Output() onClosed: EventEmitter<any> = new EventEmitter();
    @Output() onSaved: EventEmitter<any> = new EventEmitter();
    @Output() onToggleExpand: EventEmitter<any> = new EventEmitter();
    @Output() onHeaderIconClicked: EventEmitter<any> = new EventEmitter();

    toggleExpand() {
        this.config.expand = !this.config.expand;
        this.onToggleExpand.emit(this.config.expand);
    }

    open() {
        this.visible = true;
    }

    close() {
        this.visible = false;
        if(this.pSideBar.mask) {
          this.pSideBar.destroyModal();
        }
        this.onClosed.emit();
    }

    headerIconClicked() {
        this.onHeaderIconClicked.emit();
    }

    secondaryAction() {
        if (this.config.secondary && this.config.secondary.callback) {
            this.config.secondary.callback();
        } else {
            this.close();
        }
    }

    tertiaryAction() {
        if (this.config.ternary && this.config.ternary.callback) {
            this.config.ternary.callback();
        } else {
            this.close();
        }
    }

    save() {
        this.onSaved.emit();
    }

    /**
     *  Emits a notification through the panel's viewhelper instance.
     */
    public notify(text: string, type: AlNotificationType, autoDismiss: number = 0) {
        this.helper.notify(text, type, autoDismiss);
    }

    /**
     *  Emits an info-style notification through the panel's viewhelper instance.
     */
    public notifyInfo(text: string, autoDismiss: number = 0, flush: boolean = false) {
        this.helper.notifyInfo(text, autoDismiss, flush);
    }

    /**
     *  Emits a warning notification through the panel's viewhelper instance.
     */
    public notifyWarning(text: string, autoDismiss: number = 0, flush: boolean = false) {
        this.helper.notifyWarning(text, autoDismiss, flush);
    }

    /**
     *  Emits an error notification through the panel's viewhelper instance.
     */
    public notifyError(text: string, autoDismiss: number = 0, flush: boolean = false) {
        this.helper.notifyError(text, autoDismiss, flush);
    }

    /**
     *  Emits an success notification through the panel's viewhelper instance.
     */
    public notifySuccess(text: string, autoDismiss: number = 0, flush: boolean = false) {
        this.helper.notifySuccess(text, autoDismiss, flush);
    }

    /**
     * Clean the notifications
     */
    public cleanNotifications() {
        this.helper.cleanNotifications();
    }
}
