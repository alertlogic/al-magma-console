/**
*  @author Juan Leon <jleon@alertlogic.com>
*
* This component is a stepper which will be used as
* tertiary menu, it has an array of steps
*
*  @copyright Alert Logic, Inc 2018
*/

import {
    ChangeDetectorRef,
    Component,
    Directive,
    EventEmitter,
    HostBinding,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { ExpandableMenuDescritor, ExpandableMenuGroup, ExpandableMenuItem } from '../../types';

@Directive({
    selector: 'al-expandable-menu-footer',
    exportAs: 'AlExpandableMenuFooterDirective'
})
export class AlExpandableMenuFooterDirective {
    @HostBinding('class') baseClass = 'al-expandable-menu-footer';
    @HostBinding('class.al-expandable-menu-footer-hide') @Input() hidden: boolean;
    @HostBinding('class.al-expandable-menu-footer-selected') @Input() active: boolean;
}

@Component({
    selector: 'al-expandable-menu',
    templateUrl: './al-expandable-menu.component.html',
    styleUrls: ['./al-expandable-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlExpandableMenuComponent implements OnChanges, OnInit {

    /**
     * Parameters inputs for the component
     */
    @Input() enableClickNavigation: boolean = true;
    @Input() enableHoverHighlight: boolean = true;

    @Input() data!: ExpandableMenuDescritor;

    /**
     * OutPuts
     */
    @Output() onClick: EventEmitter<ExpandableMenuOnClick> = new EventEmitter();

    @Output() onMenuProcessed: EventEmitter<void> = new EventEmitter()


    private shadowPlainItem: Array<string> = [];
    api: ExpandableMenuApi;

    constructor() {
        this.api = {
            closeAll: this.closeAll,
            openAll: this.openAll,
            next: this.next,
            whichNext: this.whichNext,
            prev: this.prev,
            goto: this.goto,
            enableItemsBefore: this.enableItemsBefore,
            disableItemsBefore: this.disableItemsBefore,
            setFakeStep: this.setFakeStep,
            setEnableClickNavigation: this.setEnableClickNavigation,
            setEnableHoverHighlight: this.setEnableHoverHighlight
        };
    }
    ngOnChanges(changes: SimpleChanges): void {

       if (this.data?.groups?.length > 0){
            this.setLast();
            this.syncArrows();
            this.syncShadowPlainItem();
            this.init();
            this.enableItems(this.data.selected);
            this.onMenuProcessed.emit();
       }
    }

    ngOnInit() {
    }

    private init() {
        let _group = this.getGroup(this.data.selected);
        if (_group) {
            this.updateGroups(_group);
        } else {
            console.error("The selected element has not been defined or does not match any element in the data structure.");
        }
    }

    private enableItems(item: string) {
        goodEvilLabel:
        for (let i = 0; i < this.data.groups.length; i++) {
            this.data.groups[i].clickable = true;
            if (this.data.groups[i].key === item) {
                break goodEvilLabel;
            }
            for (let j = 0; j < this.data.groups[i].items.length; j++) {
                this.data.groups[i].items[j].clickable = true;
                if (this.data.groups[i].items[j].key === item) {
                    break goodEvilLabel;
                }
            }
        }
    }

    private enableItemsBefore = (item: string) => {
        this.enableItems(item);
    }

    private disableItems(item: string) {
        goodEvilLabel:
        for (let i = 0; i < this.data.groups.length; i++) {
            this.data.groups[i].clickable = false;
            if (this.data.groups[i].key === item) {
                break goodEvilLabel;
            }
            for (let j = 0; j < this.data.groups[i].items.length; j++) {
                this.data.groups[i].items[j].clickable = false;
                if (this.data.groups[i].items[j].key === item) {
                    break goodEvilLabel;
                }
            }
        }
    }

    private disableItemsBefore = (item: string) => {
        this.disableItems(item);
    }

    private nextItem() {
        if (this.shadowPlainItem.length > 0) {
            if (this.shadowPlainItem[this.shadowPlainItem.length - 1] === this.data.selected) {
                return null;
            } else {
                let next: number = null;
                this.shadowPlainItem.forEach((item, n) => {
                    if (item === this.data.selected) {
                        next = n + 1;
                    }
                });
                let group = this.getGroup(this.shadowPlainItem[next]);
                if (group) {
                    this.updateGroups(group);
                }
                this.enableItems(this.shadowPlainItem[next]);
                return this.shadowPlainItem[next];
            }
        } else {
            return null;
        }
    }

    private getGroup(itemKey: string) {
        let _group: Array<ExpandableMenuGroup> = this.data.groups.filter((group) => {
            let _item = group.items.filter((item) => {
                return item.key === itemKey;
            });
            return (_item.length > 0 || group.key === itemKey);
        });
        return _group.length > 0 ? _group[0] : null;
    }

    private updateGroups(group: ExpandableMenuGroup) {
        if (group) {
            group.opened = true;
            group.clickable = true;
        }
    }

    private prevItem() {
        if (this.shadowPlainItem.length > 0) {
            if (this.shadowPlainItem[0] === this.data.selected) {
                return null;
            } else {
                let prev: number = null;
                this.shadowPlainItem.forEach((item, n) => {
                    if (item === this.data.selected) {
                        prev = n - 1;
                    }
                });
                return this.shadowPlainItem[prev];
            }
        } else {
            return null;
        }
    }

    private next = () => {
        if (this.data.selected) {
            const next: string = this.nextItem();
            this.data.selected = next ? next : this.data.selected;
            let group = this.getGroup(next);
            this.onClick.emit({
                groupKey: (group && group.items.length > 0) ? group.key : null,
                itemKey: this.data.selected
            });
        }
    }

    private whichNext = () => {
        return this.nextItem();
    }

    private prev = () => {
        if (this.data.selected) {
            const prev: string = this.prevItem();
            this.data.selected = prev ? prev.toString() : this.data.selected;
            let group = this.getGroup(prev);
            this.onClick.emit({
                groupKey: (group && group.items.length > 0) ? group.key : null,
                itemKey: this.data.selected
            });
        }
    }

    private goto = (item: string) => {
        let group = this.getGroup(item);
        if (group) {
            this.data.selected = item;
            if (group.items.length > 0) {
                this.enableItems(item);
            } else {
                this.enableItems(group.key);
            }
            this.updateGroups(group);
        }
    }

    private setEnableClickNavigation = (value: boolean) => {
        this.enableClickNavigation = value;
    }

    private setEnableHoverHighlight = (value: boolean) => {
        this.enableHoverHighlight = value;
    }

    private openAll = () => {
        this.data.groups.map((group) => {
            group.opened = true;
            return group;
        });
        this.syncArrows();
    }

    private closeAll = () => {
        this.data.groups.map((group) => {
            group.opened = false;
            return group;
        });
        this.syncArrows();
    }

    public clickItem(groupKey: string, itemKey: string) {
        let group = groupKey ? this.getGroup(groupKey) : this.getGroup(itemKey);
        let _item: ExpandableMenuItem = null;
        if (itemKey && group) {
            _item = group.items.filter((item) => {
                return (item.key === itemKey);
            })[0];
        }
        if ((this.enableClickNavigation && (group.clickable && group.items.length === 0))
            || (this.enableClickNavigation && (group.items.length > 0 && _item && _item.clickable))) {
            this.data.selected = itemKey;
            this.onClick.emit({
                groupKey: groupKey,
                itemKey: itemKey
            });
        }
    }

    /**
    * Set selected step to null and emit a 'fake' step.
    *
    * @param itemKey value of the itemKey used to emit a step
    *
    */
    private setFakeStep = (itemKey?: string) => {
        if (this.data.selected) {
            this.data.selected = null;
            this.onClick.emit({
                groupKey: null,
                itemKey: itemKey
            });
        }
    }

    /**
     * Search for selected items in the group
     *
     * @param itemKey Current item key
     * @returns boolean
     */
    public highlightSelectedItems(itemKey: string): boolean {
        return this.data.selected === itemKey;
    }

    /**
     * This method allows syncronize the arrows of the title with
     * the opened property of the each group
     */
    private syncArrows() {

        this.data.groups = this.data.groups.map((group) => {
            if (group.opened) {
                group.arrow = "keyboard_arrow_up";
            } else {
                group.arrow = "keyboard_arrow_down";
            }
            return group;
        });

    }

    /**
     * Open or close the clicked group
     * @param element key to identify the clicked group
     */
    public toggleGroup(element) {
        let _group = this.getGroup(element);
        if (_group && _group.clickable) {
            this.data.groups = this.data.groups.map((group) => {
                if (group.key === element) {
                    group.opened = !group.opened;
                }
                return group;
            });
            this.syncArrows();
        }
    }

    /**
     * TODO: improve this function
     * Identify what is the last element in the group collection.
     */
    private setLast() {
        const n = this.data.groups.length;
        let i = 1;
        this.data.groups.forEach((group) => {
            if (i++ === n) {
                group.last = true;
            } else {
                group.last = false;
            }
        });

    }

    private syncShadowPlainItem() {
        this.data.groups.forEach((group) => {
            if (group.items.length > 0) {
                group.items.forEach(item => {
                    if (item.visible) {
                        this.shadowPlainItem.push(item.key);
                    }
                });
            } else {
                this.shadowPlainItem.push(group.key);
            }
        });

    }

}

export interface ExpandableMenuApi {
    closeAll: Function;
    openAll: Function;
    next: Function;
    whichNext: Function;
    prev: Function;
    goto: Function;
    enableItemsBefore: Function;
    disableItemsBefore: Function;
    setFakeStep: Function;
    setEnableClickNavigation: Function;
    setEnableHoverHighlight: Function;
}

export interface ExpandableMenuOnClick {
    groupKey: string;
    itemKey: string;
}
