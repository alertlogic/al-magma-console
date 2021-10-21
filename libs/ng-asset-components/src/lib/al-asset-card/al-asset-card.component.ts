
/**
 * Displays the information of an asset in a simple card.
 */
import {
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter,
} from '@angular/core';
import {
    AssetTypeDictionary,
    AlAssetsQueryClient,
    AssetsQueryParams,
} from '@al/assets-query';
import { AssetDetail } from '../types';

@Component({
    selector: 'al-asset-card',
    templateUrl: './al-asset-card.component.html',
    styleUrls: ['./al-asset-card.component.scss'],
})
export class AlAssetCardComponent implements OnInit {
    @Input()
    public asset!: AssetDetail;

    @Input()
    public deploymentDictionary:{[i:string]:{name?:string,type?:string}} = {};

    @Input()
    public expanded: boolean = false;

    @Input()
    public checkable:boolean= false;

    @Input() expandable: boolean = true;
    /**
    * Outputs
    */
    @Output() onExpand: EventEmitter<any> = new EventEmitter();
    @Output() onChangeChecked = new EventEmitter<AssetDetail>();

    ngOnInit() {
        // Empty
    }

    toggleAssetDetails($event:any) {
        $event.stopPropagation();

        this.onExpand.emit(this.asset);

        if (!this.asset.hasComplementaryData) {
            let params:AssetsQueryParams = {
                asset_types: this.asset.type,
                reduce: true
            };
            let filterKey = this.asset.type + ".key";
            params[filterKey] = this.asset.key;
            if (this.asset.accountId && this.asset.deploymentId) {
                AlAssetsQueryClient.getDeploymentAssets(this.asset.accountId, this.asset.deploymentId, params).then(assetData => {
                    this.asset.hasComplementaryData = true;
                    if ( assetData.assets[0]) {
                        let data:any = assetData.assets[0];
                        const assetTypes = AssetTypeDictionary.types['_default'];
                        if (assetTypes.getAssetDetails) {
                            this.asset.details = assetTypes.getAssetDetails(data[0]);
                        }
                    }
                });
            } else {
                console.error("Asset details accountId and deploymentId required.");
            }
        }
    }

    /* Change the checkbox state and emit an event
    * @param checked: boolean
    */
    toggleCheck(checked: boolean): void {
       this.asset.checked = checked;
       this.onChangeChecked.emit(this.asset);
   }
}
