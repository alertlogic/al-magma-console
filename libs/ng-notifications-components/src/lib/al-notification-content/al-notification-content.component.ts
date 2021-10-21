import { AlCardstackItem, SQXSearchQuery } from '@al/core';
import { AlDeploymentsClient, Deployment } from '@al/deployments';
import {
    AlExposureNotificationsClient,
    AlNotificationPolicy,
    AssetFilter,
    Subscription
} from '@al/exposure-notifications';
import { AlGenericAlertDefinition } from '@al/gestalt';
import {
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { AssetFilterOption, AssetFilterUnpacker } from '../services/al-health-notification-utility';

@Component({
    selector: 'al-notification-content',
    templateUrl: './al-notification-content.component.html',
    styleUrls: ['./al-notification-content.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AlNotificationContentComponent implements OnInit {

    @Input() item!: AlCardstackItem<AlGenericAlertDefinition, any>;
    @Input() isSko2021Beta: boolean = false;
    @Input() accountId:string = "";

    public alertTypes:Array<string> = [];
    public deploymentsSelected:Array<string> = [];
    public deploymentDictionary:{[i:string]:string} = {};
    public conditions:SQXSearchQuery = new SQXSearchQuery();
    public subscriptionsDictionary: {[subscriptionId: string]: Subscription} = {};
    public healthPolicy: AlNotificationPolicy = {} as AlNotificationPolicy;
    public allAvailableAssets: AssetFilter[] = [];
    private policies: AlNotificationPolicy[] = [];

    closeError(item: AlCardstackItem<AlGenericAlertDefinition, any>) {
        item.properties.error = null;
    }

    async ngOnInit(): Promise<void> {
        if( this.accountId !== "" ) {
            await AlDeploymentsClient.listDeployments(this.accountId).then((response: Deployment[]) => {
                response.forEach( (deployment:Deployment) => {
                    if( deployment.id && deployment.name ) {
                        this.deploymentDictionary[deployment.id] = deployment.name;
                    }
                });
            }, error => {
                console.error(error);
            });
            if (this.item && this.item.entity.type.notificationType === 'health/alerts') {
                await this.getHealthNotificationsDetails();
            }
        }
        if(this.item.properties.filters) {
            this.conditions = SQXSearchQuery.fromJson(this.item.properties.filters);
        }
        this.policies = await AlExposureNotificationsClient.getNotificationPolicies(this.accountId);
    }

    /**
     * getGovernanceText
     * @param value represents value in minutes for suppression interval
     * @returns human redable text
     */
    getGovernanceText(value: number): string {
        let textToShow = "None";
        if (this.accountId) {
            textToShow = this.policies.filter(policy => (policy.schedule.delay/60000) === value).pop()?.name ?? "None";
        }
        return textToShow;
    }

    /**
     * getHealthFilters
     * @param type String: it could be 'notification.agent_status' 'notification.appliance_status' 'notification.appliance_status'.
     * @returns the value label.
     */
    getHealthFilters(type:string) {
        if( this.conditions && type !== "assets" && this.item.properties.filters && this.item.properties.filters !== {} ) {
            const opFilter = this.conditions.getPropertyCondition(type);
            if(opFilter) {
                return opFilter.getValues() as string[];
            } else {
                return [];
            }
        } else if (type === "assets" && this.item.properties.filters && this.item.properties.filters.hasOwnProperty('and')) {
            const unpacker = new AssetFilterUnpacker(this.item.properties.filters['and']);
            const assets: AssetFilterOption[] = unpacker.extractAssetsFromOr() as AssetFilterOption[];
            const assetsOptions: string[] = assets.map(
                asset => {
                    const assetType: string = asset.hasOwnProperty("asset.deployment_id") ? "deployment" : asset.hasOwnProperty("asset.vpc")? "vpc":"subnet";
                    const someAsset = this.allAvailableAssets.some(
                        availableAsset => {
                            const basicValidation: boolean = availableAsset.deployment_id === asset['asset.deployment_id'] && availableAsset.type === assetType;
                            if(assetType === "deployment") {
                                return basicValidation;
                            } else {
                                return (availableAsset.type === assetType) && availableAsset.key === (asset['asset.vpc']??asset['asset.subnet']);
                            }
                        }
                    );
                    if (someAsset) {
                        if(assetType === "deployment") {
                            return assetType+" : "+this.deploymentDictionary[asset['asset.deployment_id']+""];
                        } else {
                            return assetType+" : "+(asset['asset.vpc']??asset['asset.subnet']);
                        }
                    } else {
                        return "";
                    }
                }
            );
            return assetsOptions.filter( asset => asset!=="" );
        } else {
            return [];
        }
    }

    private async getHealthNotificationsDetails() {
        this.subscriptionsDictionary = {};
        const subscriptions: Subscription[] = await AlExposureNotificationsClient.getSubscriptions(this.accountId);
        subscriptions.forEach(subscription => {
            if (subscription.subscription.hasOwnProperty('id') && subscription.subscription.id) {
                this.subscriptionsDictionary[subscription.subscription.id] = subscription;
            }
        });
        const subscription: Subscription = this.subscriptionsDictionary[this.item.id];
        if (subscription && subscription.notification_policy !== null) {
            const policyId: string = subscription.notification_policy.id;
            this.healthPolicy = await AlExposureNotificationsClient.getNotificationPolicy(this.accountId, policyId);
        }
        // Getting all available assets, we need this to descart assets wich not exist anymore
        const notificationFilters: { [filterName: string]: string[] | AssetFilter[]; }[] = await AlExposureNotificationsClient.getNotificationRules(this.accountId);
        if (notificationFilters && Array.isArray(notificationFilters)) {
            notificationFilters.forEach(notiFilter => {
                if (notiFilter.hasOwnProperty('assets') && Array.isArray(notiFilter['assets'])) {
                    notiFilter['assets'].forEach((filter: string | AssetFilter) => {
                        if (typeof filter !== "string") {
                            this.allAvailableAssets.push(filter);
                        }
                    });
                }
            });
        }
    }

}
