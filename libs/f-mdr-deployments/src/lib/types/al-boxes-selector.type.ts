/**
 *  BoxDescriptor
 *
 *  @author Carlos Orozco <carlos.orozco@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */
export class BoxDescriptor {

    id: string = "";
    label: string = "";
    selected: boolean = true;

    constructor() { }

    /**
     *  import
     *
     *  @param rawData object with the attributes to set a box item
     *  @return Object of type BoxDescriptor
     */
    public setDescriptor(rawData: any) {

        let item = new BoxDescriptor();

        item.id = rawData.hasOwnProperty('id') ? rawData.id : "";
        item.label = rawData.hasOwnProperty('label') ? rawData.label : "";
        item.selected = rawData.hasOwnProperty('selected') ? rawData.selected : true;

        return item;
    }

}
