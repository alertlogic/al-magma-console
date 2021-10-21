/**
 * Remediations List Component
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { RemediationsCardstackView, RemediationProperties } from './remediations.cardstack';
import { AlBaseCardItem } from '@al/ng-cardstack-components';
import { AlBaseViewExposuresComponent } from '../al-base-view-exposures/al-base-view-exposures.component';
import { AlCardstackItem, AlSubscriptionGroup, AlSession, AlActingAccountResolvedEvent, AlActingAccountChangedEvent } from '@al/core';
import { FiltersUtilityService, FilterDefinitionsService } from '../services';
import { DatePipe } from '@angular/common';
import { AlStateFilterDescriptor, AlTrackingMetricEventName, AlTrackingMetricEventCategory  } from '@al/ng-generic-components';
import { ExposureQueryResultItem } from '@al/assets-query';
import { AppConstants } from '../constants';

@Component({
    selector: 'remediations',
    templateUrl: './remediations.component.html',
    styleUrls: ['./remediations.component.scss']
})
export class RemediationsComponent extends AlBaseViewExposuresComponent implements OnInit, OnDestroy {

    public view: RemediationsCardstackView;
    public alBaseCardConfig = {...AppConstants.Characteritics.defaultBaseCardConfig,...{hasIcon: false}};

    protected subscriptions = new AlSubscriptionGroup(null);


    constructor(
        protected filterUtilityService: FiltersUtilityService,
        protected filterDefinitionsService: FilterDefinitionsService,
        protected datePipe: DatePipe
    ) {
        super();
    }

    ngOnInit() {
        this.viewName = 'remediations';
        const navigationState = this.alNavigationService.routeData.pageData.state;
        let sortableBy = ['threatiness','vinstances_count', 'affected_asset_count', 'caption'];
        let order :string;
        if(navigationState ===AppConstants.PageConstant.Disposed){
            sortableBy.unshift('expiration_Date');
             order = 'asc';
        }

        this.view = new RemediationsCardstackView(this.filterUtilityService, this.filterDefinitionsService);
        this.view.characteristics = this.filterUtilityService.generateDefaultCharacteristics('vpc', 'Remediations', 'remediations',[],sortableBy, order, navigationState);
        this.subscriptions.manage( AlSession.notifyStream.attach(AlActingAccountChangedEvent, () => this.onActingAccountChanged() ) );
        this.initialiseCardstackView(this.viewName);
        this.alNavigationService.track(AlTrackingMetricEventName.UsageTrackingEvent, {
            category: AlTrackingMetricEventCategory.ExposuresAction,
            action: 'Event Click',
            label: (this.viewName === 'exposures' ? 'Exposure' : 'Remediation')+"/"+this.filterUtilityService.activeStateFilter.label
        });
    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }

    onStateFilterChanged(stateFilter: AlStateFilterDescriptor) {
        this.filterUtilityService.onStateFilterChanged(this.alCardstack, stateFilter, 'remediations');
    }

    getRemediationDetails = (item: AlCardstackItem<ExposureQueryResultItem, RemediationProperties>): AlBaseCardItem => {
        return item.properties;
    }

    /**
     * @Overwrite
     */
    protected async exportData(): Promise<string> {
        let data = "";
        const state = this.filterUtilityService.activeStateFilter.label;
        const columnHeaders: string[] = [
            "Type",
            "Remediation Name",
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
        data += await this.getBody("Remediation", state, this.view.usersMap);
        return data;
    }
}
