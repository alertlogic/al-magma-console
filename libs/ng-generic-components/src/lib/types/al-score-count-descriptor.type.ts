/**
 *  AlScoreCountDescriptor
 *
 *  @author maryit sanchez <msanchez@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */

/**
 *  AlScoreCountDescriptor provides a class to describe a score count
 */
export class AlScoreCountDescriptor {
    public critical: number;
    public high: number;
    public medium: number;
    public low: number;
    public none: number;
    public info: number;
    public count: number = 0;

    /**
     *  Import
     *
     *  @param rawData array of objects
     *  @return AlScoreCountDescriptor
     */
    public static import(rawData: { [property: string]: number; }) {

        let item = new AlScoreCountDescriptor();

        item.critical = rawData.hasOwnProperty('critical') ? rawData.critical : 0;
        item.high = rawData.hasOwnProperty('high') ? rawData.high : 0;
        item.medium = rawData.hasOwnProperty('medium') ? rawData.medium : 0;
        item.low = rawData.hasOwnProperty('low') ? rawData.low : 0;
        item.none = rawData.hasOwnProperty('none') ? rawData.none : 0;
        item.info = rawData.hasOwnProperty('info') ? rawData.info : 0;
        item.count = item.high + item.medium + item.low + item.none;

        return item;
    }

}
