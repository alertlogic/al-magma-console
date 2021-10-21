import { Component, Input } from '@angular/core';

@Component({
    selector: 'al-remediation-asset-item',
    templateUrl: './al-remediation-asset-item.component.html',
    styleUrls: ['./al-remediation-asset-item.component.scss']
})
export class AlRemediationAssetItemComponent {
    /**
     * Parameters inputs for the component
     */
    @Input() iconClass: string = '';
    @Input() name: string = '';
    @Input() score?: number;

    public severity:string = '';

    getIcon() {
        switch (this.iconClass){
            case 'high':
                this.severity = 'High';
                return 'al al-risk-1 risk critical';
            case 'medium':
                this.severity = 'Medium';
                return 'al al-risk-2 risk high';
            case 'low':
                this.severity ='Low';
                return 'al al-risk-3 risk medium';
            case 'info':
                this.severity ='Info';
                return 'al al-risk-1 risk low';
            case 'none':
                return 'al al-risk-4 risk info';
            default:
                return this.iconClass;
        }
    }
}
