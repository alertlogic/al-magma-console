/**
 *  ConfigSelectableListDescriptor
 *
 *  @author Carlos Orozco <carlos.orozco@alertlogic.com>
 *  @author Juan Leon <jleon@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */
export class ConfigSelectableListDescriptor {

    key: string;
    title: string;
    optionButton: string;
    labels: Array<string>;
    textAlign: string;
    icon: ConfigSelectableListIcon;
    type: string;
    subItems: ConfigSelectableSubItem[];
    parentId?: string;


    constructor() { }

    /**
     *  import
     *
     *  @param rawData object with the attributes to set the selectable list
     *  @return Object of type ConfigSelectableListDescriptor
     */
    public static import(rawData: any): ConfigSelectableListDescriptor  {

        let item = new ConfigSelectableListDescriptor();

        item.key            = rawData.hasOwnProperty('key') ? rawData.key : "";
        item.title          = rawData.hasOwnProperty('title') ? rawData.title : "";
        item.optionButton   = rawData.hasOwnProperty('optionButton') ? rawData.optionButton : null;
        item.labels         = rawData.hasOwnProperty('labels') ? rawData.labels : [];
        item.textAlign      = rawData.hasOwnProperty('textAlign') ? rawData.textAlign : "left";
        item.icon           = rawData.hasOwnProperty('icon') ? ConfigSelectableListIcon.import(rawData.icon) : null;
        item.type           = rawData.hasOwnProperty('type') ? rawData.type : '';
        item.subItems       = rawData.hasOwnProperty('subItems') ? (rawData.subItems as []).map(rawItem => ConfigSelectableSubItem.import(rawItem)) : [];
        if (rawData.hasOwnProperty('parentId')) {
            item.parentId = rawData.parentId;
        }

        return item;
    }

}

export class ConfigSelectableSubItem {

    id: string;
    parentId: string;
    title: string;
    details: string;
    icon: ConfigSelectableListIcon;
    type?: string;

    public static import(rawItem: any) {
        let item =  new ConfigSelectableSubItem();

        item.id = rawItem.hasOwnProperty('id') ? rawItem.id : "";
        item.parentId = rawItem.hasOwnProperty('parentId') ? rawItem.parentId : "";
        item.title = rawItem.hasOwnProperty('title') ? rawItem.title : "";
        item.details = rawItem.hasOwnProperty('details') ? rawItem.details : "";
        item.icon = rawItem.hasOwnProperty('icon') ? ConfigSelectableListIcon.import(rawItem.icon) : null;
        item.type = rawItem.hasOwnProperty('type') ? rawItem.type : "";

        return item;
    }

}

export class ConfigSelectableListIcon {

    alClass: string;
    material: string;

    constructor() { }

    /**
     *  import
     *
     *  @param rawData object with the attributes to set the icon to show
     *  @return Object of type ConfigSelectableListIcon
     */
    public static import(rawData: any): ConfigSelectableListIcon {

        let icon = new ConfigSelectableListIcon();

        icon.alClass = rawData.hasOwnProperty('alClass') ? rawData.alClass : '';
        icon.material = rawData.hasOwnProperty('material') ? rawData.material : '';

        if (icon.material !== '') {
            icon.alClass = "material-icons";
        }

        return icon;
    }

}

export class ConfigSelectableListAction {

    icon: ConfigSelectableListIcon;
    label: string;
    isRight: boolean;

    constructor() { }

    /**
     *  import
     *
     *  @param rawData object with the attributes to set the action button
     *  @return Object of type ConfigSelectableListAction
     */
    public static import(rawData: any): ConfigSelectableListAction {

        let action = new ConfigSelectableListAction();

        action.icon = rawData.hasOwnProperty('icon') ? ConfigSelectableListIcon.import(rawData.icon) : null;
        action.label = rawData.hasOwnProperty('label') ? rawData.label : null;
        action.isRight = rawData.hasOwnProperty('isRight') ? rawData.isRight : false;

        return action;
    }
}

export class ConfigSelectableListConfigDescriptor {

    zeroStateIcon: ConfigSelectableListIcon;
    zeroStateMessage: string;
    height: string;
    actions: ConfigSelectableListAction;
    orderBy: Array<string> | string;
    orderUpward: boolean;

    constructor() { }

    /**
     *  import
     *
     *  @param rawData object with the attributes to set the config of the componet
     *  @return Object of type ConfigSelectableListConfigDescriptor
     */
    public static import(rawData: any): ConfigSelectableListConfigDescriptor {

        let config = new ConfigSelectableListConfigDescriptor();

        config.zeroStateIcon =    rawData.hasOwnProperty('zeroStateIcon') ? ConfigSelectableListIcon.import(rawData.zeroStateIcon): null;
        config.zeroStateMessage = rawData.hasOwnProperty('zeroStateMessage') ? rawData.zeroStateMessage : "No assets chosen yet";
        config.height = rawData.hasOwnProperty('height') ? rawData.height : "350px";
        if (rawData.hasOwnProperty('actions')) {
            config.actions = ConfigSelectableListAction.import(rawData.actions);
        } else {
            config.actions = null;
        }
        config.orderBy = rawData.hasOwnProperty('orderBy') ? rawData.orderBy : null;
        config.orderUpward = rawData.hasOwnProperty('orderUpward') ? rawData.orderUpward : true;

        return config;
    }

}
