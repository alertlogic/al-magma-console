/**
 *  Expandable Menu types
 *
 *  @author Juan Leon <jleon@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */

export class ExpandableMenuItem {
    public key: string;
    public title: string;
    public visible?: boolean;
    public clickable?: boolean;

    public static import(rawData: any) {
        let item: ExpandableMenuItem = new ExpandableMenuItem();

        item.key = rawData.hasOwnProperty('key') ? rawData.key : null;
        item.title = rawData.hasOwnProperty('title') ? rawData.title : '';
        item.visible = rawData.hasOwnProperty('visible') ? rawData.visible : true;
        item.clickable = rawData.hasOwnProperty('clickable') ? rawData.clickable : false;

        return item;
    }
}

export class ExpandableMenuItemCollection {
    public static import(rawData: any) {
        let items: Array<ExpandableMenuItem> = [];

        for (var i = 0; i < rawData.length; i++) {
            let item: ExpandableMenuItem = new ExpandableMenuItem();
            item =  ExpandableMenuItem.import(rawData[i]);
            items.push(item);
        }
        return items;
    }
}
export class ExpandableMenuGroup {
    public key: string;
    public title: string;
    public opened?: boolean;
    public items?: Array<ExpandableMenuItem>;
    public visible?: boolean;
    public clickable?: boolean;
    public last?: boolean;
    public arrow?: string;

    public static import(rawData: any) {
        let item: ExpandableMenuGroup = new ExpandableMenuGroup();

        item.key = rawData.hasOwnProperty('key') ? rawData.key : null;
        item.title = rawData.hasOwnProperty('title') ? rawData.title : '';
        item.opened = rawData.hasOwnProperty('opened') ? rawData.opened : false;
        item.visible = rawData.hasOwnProperty('visible') ? rawData.visible : true;
        item.clickable = rawData.hasOwnProperty('clickable') ? rawData.clickable : false;
        item.last = rawData.hasOwnProperty('last') ? rawData.last : false;
        item.arrow = rawData.hasOwnProperty('arrow') ? rawData.arrow : null;
        if (rawData.hasOwnProperty('items')) {
            item.items = ExpandableMenuItemCollection.import(rawData.items);
        } else {
            item.items = [];
        }
        return item;
    }
}
export class ExpandableMenuGroupCollection {
    public static import(rawData: any): Array<ExpandableMenuGroup>  {
        let items: Array<ExpandableMenuGroup> = [];

        for (var i = 0; i < rawData.length; i++) {
            let item: ExpandableMenuGroup = new ExpandableMenuGroup();
            item =  ExpandableMenuGroup.import(rawData[i]);
            items.push(item);
        }
        return items;
    }
}
export class ExpandableMenuDescritor {
    public selected: string;
    public groups: Array<ExpandableMenuGroup>;

    public static import(rawData: any) {
        let item: ExpandableMenuDescritor = new ExpandableMenuDescritor();

        item.selected = rawData.hasOwnProperty('selected') ? rawData.selected : null;
        if (rawData.hasOwnProperty('groups')) {
            item.groups = ExpandableMenuGroupCollection.import(rawData.groups);
        } else {
            item.groups = [];
        }

        return item;
    }
}



