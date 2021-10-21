/**
 * AlManageExperienceService
 *
 * @author Bryan Tabarez <bryan.tabarez@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2019
 */

import {
    AlToastButtonDescriptor,
    AlToastService
} from '@al/ng-generic-components';
import {
    AlActingAccountResolvedEvent,
    AlGlobalizer,
    AlLocation,
    AlLocatorService,
    AlSession,
    AlEntitlementCollection,
} from '@al/core';

import { Injectable } from '@angular/core';

import {
    IEWarningState,
} from '../types';

import { AlExperiencePreferencesService } from './al-experience-preferences.service';

import { AlNavigationService } from './al-navigation.service';

@Injectable({
    providedIn: 'root'
})
export class AlManageExperienceService {

    private firstTime: boolean = true;

    private readonly toastIEWarning = {
        sticky: true,
        closable: false,
        data: {
            html: "<p>Your current browser may prevent you from accessing certain features on this page. " +
                "Alert Logic recommends using the latest version of a supported browser for optimal performance. " +
                "Go to <a href='https://docs.alertlogic.com/requirements/operating-system-browsers.htm' target='_blank'> " +
                "Operating System and Browser Requirements</a> to see supported operating systems and browsers.</p>",
            buttons: [
                {
                    key: 'ie-warning',
                    label: 'OK',
                    class: 'p-col-fixed',
                    textAlign: 'center'
                }
            ]
        }
    };

    private readonly mdrEntitlements = 'assess|detect|respond|tmpro|lmpro';

    constructor(
        public experiencePreferences: AlExperiencePreferencesService,
        public alNavigation: AlNavigationService,
        public alToastService: AlToastService,
    ) { }

    init = (): void => {
        AlSession.notifyStream.attach(AlActingAccountResolvedEvent, this.onActingAccountResolved);
        this.loadNavigationExperience();
        this.alToastService.getButtonEmitter('ie-toast').subscribe(this.handleIEToastButtonEmitter);
        this.expose();
    }

    /**
     * Load the navigation experience - set experience, schema, toast messages
     */
    async loadNavigationExperience(): Promise<void> {
        const effectiveEntitlements: AlEntitlementCollection = await AlSession.getEffectiveEntitlements();
        const isAaidDashboardsEnabled: boolean = effectiveEntitlements.evaluateExpression(this.mdrEntitlements);

        if (isAaidDashboardsEnabled) {
            this.setDashboardExp();
        } else {
            this.setClassicExp();
            this.setIe11Toast();
        }
    }

    /**
     * Save and load the experience preference selected through ToastComponent
     */
    manageExperienceOption(option: string): void {
        switch (option) {
            case 'go-to-classic':
                this.setClassicExp();
                if (AlLocatorService.getActingNode().locTypeId === AlLocation.DashboardsUI) {
                    this.alNavigation.navigate.byNamedRoute('cd17:overview');
                }
                break;
            case 'go-to-dashboards':
                this.setDashboardExp();
                break;
            case 'ie-warning':
                this.experiencePreferences.saveIEWarningPreferences("showed");
                break;
            default:
                console.warn(`manageExperienceOption: ${option} is an invalid experience option`);
                break;
        }
    }

    private async setIe11Toast(): Promise<void> {
        if (this.alNavigation.getExperience() === "beta") {
            const state: IEWarningState = await this.experiencePreferences.getIEWarningPreferences();
            if (this.alNavigation.isIEBrowser() && (!state || state === "not_showed")) {
                this.experiencePreferences.saveIEWarningPreferences("showing");
                setTimeout(() =>
                    this.alToastService.showMessage('ie-toast', this.toastIEWarning)
                );
            }
        }
    }

    private setDashboardExp(): void {
        this.alNavigation.setExperience('beta');
        this.alNavigation.setSchema('siemless');
    }

    private setClassicExp(): void {
        this.alNavigation.setExperience("default");
        this.alNavigation.setSchema("cie-plus2");
    }

    private onActingAccountResolved = (event: AlActingAccountResolvedEvent): void => {
        // The first time it will be called from the init method when the view is ready
        if (!this.firstTime) {
            this.loadNavigationExperience();
        }
        this.firstTime = false;
    }

    private handleIEToastButtonEmitter = (_: AlToastButtonDescriptor): void => {
        this.experiencePreferences.saveIEWarningPreferences("showed");
        this.alToastService.clearMessages('ie-toast');
    }

    private expose(): void {
        AlGlobalizer.expose('al.experienceManager', {
            routingHost: this,
            manageExperienceOption: (option: string) => {
                this.manageExperienceOption(option);
            }
        });
    }
}
