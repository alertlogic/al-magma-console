
import { from as observableFrom} from 'rxjs';

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { TabsDescriptor } from '@components/technical-debt';
import { Deployment } from '@al/deployments';
import { DeploymentsUtilityService } from '../../../shared/services/deployment-utility.service';
import { AlAssetsQueryClient } from '@al/assets-query';

@Component({
    selector: 'al-deployment-installation-instructions',
    templateUrl: './deployment-installation-instructions.component.html',
    styleUrls: ['./deployment-installation-instructions.component.scss']
})
export class DeploymentInstallationInstructionsComponent implements OnInit {

    @Input() accountId: string;
    @Output() onExitAction: EventEmitter<null> = new EventEmitter();

    // ******************* al-tabs configs *******************
    public instructionsTabs: TabsDescriptor;
    public selectedTab: string;

    public appliances: Array<any>;
    public filteredAppliances: Array<any>;
    public deployment: Deployment;

    constructor(protected deploymentsService: DeploymentsUtilityService) { }

    ngOnInit() {
        this.deployment = this.deploymentsService.getDeploymentOnTracking();
        this.filteredAppliances = [];
        this.loadNetworks();
        let tabs;
        if ( this.isAutomaticAWS() ||
            (this.deployment.platform.type === 'azure')) {
            tabs = [
                { title: "Agents", key: "agents" }
            ];
            this.selectedTab = 'agents';
        } else {
            tabs = [
                { title: "Appliances", key: "appliances" },
                { title: "Agents", key: "agents" }
            ];
            this.selectedTab = 'appliances';
        }
        this.instructionsTabs = new TabsDescriptor().import({
            tabs
        });
    }

    changeTab(tab) {
        this.selectedTab = tab.hasOwnProperty('key') ? tab.key : "appliances";
    }

    searchFilters(query: string) {
        this.filteredAppliances = this.appliances.filter(
            appliance => appliance.name.toLowerCase().match(query.toLowerCase()));
    }

    exit() {
        this.onExitAction.emit();
    }

    copyText(val: string) {
        let selBox = document.createElement('textarea');
        selBox.value = val ? val : null;
        document.body.appendChild(selBox);
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
    }

    private loadNetworks(): void {
        if (!this.isAutomaticAWS()) {
            observableFrom(
                AlAssetsQueryClient.getDeploymentAssets(this.accountId, this.deployment.id, { 'asset_types': 'vpc' })
            ).subscribe(
                response => {
                    this.appliances = response.assets.map(x => x[0]);
                    this.filteredAppliances = this.appliances.slice();
                },
                error => {
                    this.appliances = [];
                    this.filteredAppliances = [];
                    console.error(error);
                }
            );
        }
    }

    private isAutomaticAWS(): boolean {
       return  this.deployment?.platform?.type === 'aws' &&
               this.deployment?.mode === 'automatic';
    }


}

