/**
 *  TabsDescriptor
 *
 *  @author Julian David <jgalvis@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */
export class TabsDescriptor {

    search?: boolean = false;
    searchPlaceholder?: string = '';
    showLabel: boolean = false;
    tabs: Tab[] = [];
    selector?: boolean = false;
    selectorOptions?: TabSelectorOptionDescriptor[] = [];
    selectorPlaceholder?: string = '';
    selectorOptionSelected?: string = '';

    constructor() { }

    /**
     *  import
     *
     *  @param rawData object with the attributes to set the tabs descriptor
     *  @return Object of type TabsDescriptor
     */
    public import(rawData: any) {

        let item = new TabsDescriptor();

        item.search = rawData.hasOwnProperty('search') ? rawData.search : false;
        item.searchPlaceholder = rawData.hasOwnProperty('searchPlaceholder') ? rawData.searchPlaceholder : '';
        item.selector = rawData.hasOwnProperty('selector') ? rawData.selector : false;
        item.selectorPlaceholder = rawData.hasOwnProperty('selectorPlaceholder') ? rawData.selectorPlaceholder : '';
        item.selectorOptionSelected = rawData.hasOwnProperty('selectorOptionSelected') ? rawData.selectorOptionSelected : '';

        if(item.searchPlaceholder !== ''){
            item.showLabel = true;
        }

        if (rawData.hasOwnProperty('tabs') && Array.isArray(rawData.tabs)) {
            for (let i = 0; i < rawData.tabs.length; i++) {
                let tab: any;
                tab = rawData.tabs[i].hasOwnProperty('key') ? new Tab().import(rawData.tabs[i]) : new Tab();
                item.tabs.push(tab);
            }
        }

        if (rawData.hasOwnProperty('selectorOptions') && Array.isArray(rawData.selectorOptions)) {
            for (let b = 0; b < rawData.selectorOptions.length; b++) {
                let option: any;
                option = rawData.selectorOptions[b].hasOwnProperty('key') ? new TabSelectorOptionDescriptor().import(rawData.selectorOptions[b]) : new TabSelectorOptionDescriptor();
                item.selectorOptions.push(option);
            }
        }

        return item;
    }

}

export class TabSelectorOptionDescriptor {

    name: string;
    key: string;

    constructor() {}

    public import(rawData: any) {
        let option: TabSelectorOptionDescriptor = new TabSelectorOptionDescriptor();

        option.name = rawData.hasOwnProperty('name') ? rawData.name : "";
        option.key = rawData.hasOwnProperty('key') ? rawData.key : "";

        return option;
    }
}

export class Tab {

    title: string = "";
    key: string = "";

    constructor() { }

    /**
     *  import
     *
     *  @param rawData object with the attributes to set the tab structure
     *  @return Object of type Tab
     */
    public import(rawData: any) {

        let item = new Tab();

        item.title = rawData.hasOwnProperty('title') ? rawData.title : "";
        item.key = rawData.hasOwnProperty('key') ? rawData.key : "";

        return item;
    }
}
