/**
 *  AlBlackCardDescriptor
 *
 *  @author Bryan Tabarez <bryan.tabarez@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */
export class AlBlackCardDescriptor {

    type: string;
    iconClass: string;
    iconMaterial: string;
    key: string;
    title: string;
    subtitle: string;

    constructor() { }

    /**
     *  import
     *
     *  @param rawData object with the attributes to set the card list
     *  @return Object of type AlBlackCardDescriptor
     */
    public import(rawData: any) {

        let item = new AlBlackCardDescriptor();

        item.type = rawData.hasOwnProperty('type') ? rawData.type : null;
        item.subtitle = rawData.hasOwnProperty('subtitle') ? rawData.subtitle : '';
        item.key = rawData.hasOwnProperty('key') ? rawData.key : null;
        item.title = rawData.hasOwnProperty('title') ? rawData.title : '';
        item.iconClass = rawData.hasOwnProperty('iconClass') ? rawData.iconClass : '';
        item.iconMaterial = rawData.hasOwnProperty('iconMaterial') ? rawData.iconMaterial : '';

        if (item.iconMaterial) {
            item.iconClass = "material-icons";
        }

        return item;
    }

}
