/**
 *  ModalCardDescriptor
 *
 *  @author Miguel Lopez <miguel.lopez@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */

 export class ModalCardDescriptor {

    public open: boolean;
    public cards: number;
    public width: string;
    public height: string;
    public closeable: boolean;

    constructor() { }

    public static setDescriptor(rawData: any) {
        let item = new ModalCardDescriptor();

        item.width = rawData.hasOwnProperty('width') ? rawData.width : "";
        item.height = rawData.hasOwnProperty('height') ? rawData.height : "";
        item.cards = rawData.hasOwnProperty('cards') ? rawData.cards : 0;
        item.closeable = rawData.hasOwnProperty('closeable') ? rawData.closeable : true;
        item.open = rawData.hasOwnProperty('open') ? rawData.open : false;

        return item;
    }
}
