import { AfterContentInit, Component, ContentChildren, EventEmitter, HostBinding, Input, Output, QueryList } from '@angular/core';
import { AlTabComponent } from './al-tab/al-tab.component';

@Component({
    selector: 'ald-tabs',
    templateUrl: './al-tabs.component.html',
    styleUrls: ['./al-tabs.component.scss']
})
export class AlTabsComponent implements AfterContentInit {

    @Input() selected: string = '';
    @Input() isSticky: boolean;

    @HostBinding('class') class = 'ald-tabs';
    @HostBinding('class.ald-layout__tabs') get stickyness() { return !this.isSticky };

    @ContentChildren(AlTabComponent) tabs: QueryList<AlTabComponent>;

    @Output() tabSelected: EventEmitter<string> = new EventEmitter();

    // contentChildren are set
    ngAfterContentInit() {

        // get all active tabs
        const activeTabs = this.tabs.filter((tab)=>tab.active);

        // if there is no active tab set, activate the first
        if (activeTabs.length === 0) {
            this.selectTab(this.tabs.first);
        }
    }

    selectTab(tab: AlTabComponent) {

        this.tabs.forEach((tab) => {
            tab.active = false;
        });

        tab.active = true;
        this.tabSelected.emit(tab.name);
    }

}
