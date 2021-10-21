import { AlResponderAction } from '@al/responder';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { AlPlaybookCardIcon, AlTaskPaletteItem } from '../types/playbook-action';

export interface LabelWithIcon {
    label: string;
    icon: AlPlaybookCardIcon;
}

@Component({
    selector: 'al-task-palette',
    templateUrl: './al-task-palette.component.html',
    styleUrls: ['./al-task-palette.component.scss']
})
export class AlTaskPaletteComponent implements OnChanges {

    public search: string = "";
    public selectedVendor: { label: string } = {label: ''};
    public vendors: LabelWithIcon[] = [];

    @Input() title: string = "";
    @Input() listOptions: AlTaskPaletteItem[] = [];
    @Output() selected: EventEmitter<string | AlResponderAction> = new EventEmitter<string | AlResponderAction>();
    @Output() closePalette: EventEmitter<void> = new EventEmitter<void>();

    ngOnChanges(): void {
        this.setVendors();
    }

    onSearch(text: string) {
        this.search = text;
    }

    onSelect(value: string | AlResponderAction | undefined) {
        this.selected.emit(value);
    }

    onClose() {
        this.closePalette.emit();
    }

    private setVendors(): void {
        let vendorList = this.listOptions.map((item: AlTaskPaletteItem) => {
            return {label: item.label, icon: item.icon};
        });

        const setObj = new Set();
        this.vendors = vendorList.reduce((acc: LabelWithIcon[], vendor) => {
            if (vendor.label && !setObj.has(vendor.label)) {
                setObj.add(vendor.label);
                acc.push(vendor as LabelWithIcon);
            }
            return acc;
        }, []);

        if (this.vendors.length > 0) {
            this.selectedVendor = this.vendors[0];
        }
        this.vendors.sort((a,b) => {
            // AWS sorts before Alert Logic because of the capital W if we don't lowercase it.
            const aLabel = a.label.toLowerCase();
            const bLabel = b.label.toLowerCase();
            return aLabel > bLabel ? 1 : aLabel < bLabel ? -1 : 0;
        });
    }

}
