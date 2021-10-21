import { Component, ViewEncapsulation } from '@angular/core';
import { SelectItem } from 'primeng/api';
@Component({
    selector: 'button-groups',
    templateUrl: './button-groups.component.html',
    styleUrls: ['./button-groups.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class ButtonGroupsComponent {

    textSelectButtons: SelectItem[];

    typesTwo: SelectItem[];

    assetTypes: SelectItem[];

    selectedType: string;
    selectedTypes: string[];

    selectedModes: string[];

    modes: SelectItem[];


    ngOnInit() {
        this.textSelectButtons = [];
        this.textSelectButtons.push({ label: 'Button One', value: 'Button One' });
        this.textSelectButtons.push({ label: 'Button Two', value: 'Button Two' });
        this.textSelectButtons.push({ label: 'Button Three', value: 'Button Three' });

        this.typesTwo = [];
        this.typesTwo.push({ label: 'ui-icon-add', value: 'Button Four' });
        this.typesTwo.push({ label: 'Button Two', value: 'Button Five' });
        this.typesTwo.push({ label: 'Button Three', value: 'Button Six' });

        this.assetTypes = [];
        this.assetTypes.push({title: 'Region', value: 'Region', icon: 'al al-region'});
        this.assetTypes.push({title: 'VPC', value: 'VPC', icon: 'al al-vpc'});
        this.assetTypes.push({title: 'Subnet', value: 'Subnet', icon: 'al al-subnet'});

        this.modes = [
            {title: 'Region', value: 'Region', icon: 'al al-region'},
            {title: 'VPC', value: 'VPC', icon: 'al al-vpc'},
            {title: 'Subnet', value: 'Subnet', icon: 'al al-subnet'}
        ];
    }
}
