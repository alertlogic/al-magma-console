/**
 *  AlProtectionBreakdownDescriptor
 *
 *  @author Juan Kremer <jkremer@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */


 export interface AlProtectionBreakdownGroupDescriptor {
    groupId: string;
    name: string;
    data: AlProtectionBreakdownDescriptor[]
 }

export class AlProtectionBreakdownDescriptor {
    public count: number = 0;
    public showCount: boolean = true;
    public label: string = "";
    public showLabel: boolean = true;
    public hideLeftSeparator: boolean = false;
    public iconClass: string = "";
    public hideItem: boolean = false;

    /**
     *  Import
     *
     *  @param rawData objects
     *  @return ItemProtectionDescriptor
     */
    public static setDescriptor(rawData: any) {

        let item = new AlProtectionBreakdownDescriptor();

        item.count = rawData.hasOwnProperty('count') ? rawData.count : 0;
        item.showCount = rawData.hasOwnProperty('showCount') ? rawData.showCount : true;
        item.label = rawData.hasOwnProperty('label') ? rawData.label : "";
        item.showLabel = rawData.hasOwnProperty('showLabel') ? rawData.showLabel : true;
        item.hideLeftSeparator = rawData.hasOwnProperty('hideLeftSeparator') ? rawData.hideLeftSeparator : false;
        item.iconClass = rawData.hasOwnProperty('iconClass') ? rawData.iconClass : "";
        item.hideItem = rawData.hasOwnProperty('hideItem') ? rawData.hideItem : false;

        return item;
    }

    /**
     *  import
     *
     *  @param rawData array of objects
     *  @return Array of objects type actionGroupDescriptor
     */
    public static import(rawData: any) {
        let items: AlProtectionBreakdownDescriptor[] = [];

        for (var i = 0; i < rawData.length; i++) {
            items.push(AlProtectionBreakdownDescriptor.setDescriptor(rawData[i]));
        }

        return items;
    }
}
