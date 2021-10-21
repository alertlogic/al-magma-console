/**
 * Network Exposures Component
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExposuresCardstackView } from './exposures.cardstack';
import { AlSubscriptionGroup, AlSession, AlActingAccountChangedEvent } from '@al/core';
import { FiltersUtilityService, FilterDefinitionsService } from '../services';
import { DatePipe } from '@angular/common';
import { AlStateFilterDescriptor, AlTrackingMetricEventName, AlTrackingMetricEventCategory } from '@al/ng-generic-components';
import { AlBaseViewExposuresComponent } from '../al-base-view-exposures/al-base-view-exposures.component';
import { AppConstants } from '../constants';

@Component({
    selector: 'exposures',
    templateUrl: './exposures.component.html',
    styleUrls: ['./exposures.component.scss']
})
export class ExposuresComponent extends AlBaseViewExposuresComponent implements OnInit, OnDestroy {
    public view: ExposuresCardstackView;
    public alBaseCardConfig = AppConstants.Characteritics.defaultBaseCardConfig;

    protected subscriptions = new AlSubscriptionGroup(null);

    constructor(
        protected filterUtilityService: FiltersUtilityService,
        protected filterDefinitionsService: FilterDefinitionsService,
        protected datePipe: DatePipe
    ) {
        super();
    }

    ngOnInit() {
        this.viewName = 'exposures';
        const navigationState = this.alNavigationService.routeData.pageData.state;
        let sortableBy = [ 'cvss_score','vinstances_count', 'affected_asset_count', 'caption'];
        let order:string;
        if (navigationState ===AppConstants.PageConstant.Disposed) {
            sortableBy.unshift('expiration_Date');
            order ='asc';
        }
        this.view = new ExposuresCardstackView(this.filterUtilityService, this.filterDefinitionsService);
        this.view.characteristics = this.filterUtilityService.generateDefaultCharacteristics('exposure', 'Exposures', 'exposures',[],sortableBy, order, navigationState);
        this.subscriptions.manage( AlSession.notifyStream.attach(AlActingAccountChangedEvent, () => this.onActingAccountChanged() ) );
        this.initialiseCardstackView(this.viewName);
        this.alNavigationService.track(AlTrackingMetricEventName.UsageTrackingEvent, {
            category: AlTrackingMetricEventCategory.ExposuresAction,
            action: 'Event Click',
            label: (this.viewName === 'exposures' ? 'Exposures' : 'Remediation')+"/"+this.filterUtilityService.activeStateFilter.label
        });
    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }

    /**
     * @Overwrite
     */
    protected async exportData(): Promise<string> {
        let data = "";
        const state = this.filterUtilityService.activeStateFilter.label;
        const columnHeaders: string[] = [
            "Type",
            "Status"
        ];
        if(state !== 'Open'){
            if(state === 'Disposed') {
                columnHeaders.push("Expires On");
            }
            columnHeaders.push("Assessed By", "Assessed On");
            if(state === 'Disposed') {
                columnHeaders.push("Comments");
            }
        }
        columnHeaders.push(
            "Account Name",
            "Deployment",
            "Category",
            "Severity",
            "CVSS Score",
            "CVE ID",
            "Exposure Name",
            "Affected Asset Name",
            "Affected Asset Type",
        );
        data += this.getRow(columnHeaders);
        data += await this.getBody("Exposure", state, this.view.usersMap);
        return data;
    }

    onStateFilterChanged(stateFilter: AlStateFilterDescriptor) {
        this.filterUtilityService.onStateFilterChanged(this.alCardstack, stateFilter, 'exposures');
    }
}
