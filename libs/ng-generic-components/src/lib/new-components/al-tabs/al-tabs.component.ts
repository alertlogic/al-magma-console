import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { AlTabComponent } from './al-tab/al-tab.component';

@Component({
    selector: 'al2-tabs',
    templateUrl: './al-tabs.component.html'
})
export class AlTabsComponent implements AfterContentInit {

    @ContentChildren(AlTabComponent) tabs: QueryList<AlTabComponent>;

    @Input() selected: string = '';
    @Output() tabSelected: EventEmitter<string> = new EventEmitter();

    // contentChildren are set
    ngAfterContentInit() {
        // get all active tabs
        let activeTabs = this.tabs.filter((tab)=>tab.active);

        // if there is no active tab set, activate the first
        if(activeTabs.length === 0) {
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
