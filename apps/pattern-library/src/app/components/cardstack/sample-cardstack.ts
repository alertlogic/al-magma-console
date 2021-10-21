import {
    AlCardstackView,
    AlCardstackItemProperties,
    AlCardstackCharacteristics,
    AlCardstackPropertyDescriptor,
    AlCardstackValueDescriptor
} from '@al/core';

import { CandyType } from './candy';

export class CandyProperties implements AlCardstackItemProperties {
    id:string;
    caption:string;
    brand:string;
    color:string;
    flavor:string;
    calories:number;
    distNetwork:string;
}

export class SampleCardstackView extends AlCardstackView<CandyType,CandyProperties> {

    constructor() {
        super();
    }

    /**
     * This functions retrieves (or in this case, generates) more data.  In addition to returning
     * a list of raw entities, it is also responsible for setting pagination information.
     */
    public async fetchData( initialLoad:boolean, remoteFilters?:any[] ):Promise<CandyType[]> {
        if ( remoteFilters && remoteFilters.length ) {
            console.log("Fetching data for remote filters", remoteFilters );
        }
        if ( initialLoad ) {
            this.remainingPages = 5;
        } else {
            this.remainingPages -= 1;
        }
        let resultList:CandyType[] = [];
        for ( let i = 0; i < 40; i++ ) {
            resultList.push( CandyType.generate() );
        }
        return resultList;
    }

    /**
     * This function extracts properties from the original entity into the property DTO
     */
    public deriveEntityProperties( candy:CandyType ):CandyProperties {
        return {
            id: candy.candyId,
            caption: candy.name,
            brand: candy.brandId,
            flavor: candy.flavor,
            color: candy.color,
            calories: candy.caloriesPerServing,
            distNetwork: candy.distNetwork
        };
    }

    /**
     * This function looks up captions and other data for discovered filter values
     */
    public decoratePropertyValue = ( entity:CandyType, pd:AlCardstackPropertyDescriptor, vd:AlCardstackValueDescriptor ) => {
        switch( pd.property ) {
            case 'brand':
                vd.caption = vd.value in CandyType.brandMap ? CandyType.brandMap[vd.value] : "Unknown Brand";
                break;
            case 'flavor':
                vd.caption = vd.value in CandyType.flavors ? CandyType.flavors[vd.value] : "Unknown Flavor";
                break;
            case 'color':
                vd.caption = vd.value in CandyType.colors ? CandyType.colors[vd.value] : "Unknown Color";
                break;
        }
    }

    /**
     * This function describes the behaviors of the view
     */
    public async generateCharacteristics():Promise<AlCardstackCharacteristics> {
        let characteristics:unknown = {
            entity: {
                property: "candyId",
                caption: "Candy"
            },
            filterableBy: [ "brand", "flavor", "color", "distNetwork" ],
            sortableBy: [ "caption", "calories" ],
            searchableBy: [ "caption", "id", "color", "brand", "flavor" ],
            definitions: {
                "brand": {
                    property: "brand",
                    caption: "Manufacturer/Brand",
                    captionPlural: "Manufacturers/Brands",
                    autoIndex: true
                },
                "flavor": {
                    property: "flavor",
                    caption: "Flavor",
                    captionPlural: "Flavors",
                    autoIndex: true
                },
                "color": {
                    property: "color",
                    caption: "Color",
                    captionPlural: "Colors",
                    autoIndex: true
                },
                "calories": {
                    property: "calories",
                    caption: "Calories"
                },
                "caption": {
                    property: "caption",
                    caption: "Name of Candy"
                },
                "distNetwork": {
                    property: "distNetwork",
                    caption: "Distribution Network",
                    remoteFilter: true,                 //  pretend this is filtered "server side"
                    values: [
                        {
                            value: 'argent1',
                            caption: "Argentinian Deluxe Dist Partners",
                            valueKey: "distNetwork-argent1"
                        },
                        {
                            value: 'always_polite',
                            caption: "Friendly Canadian Distributors",
                            valueKey: "distNetwork-canuck"
                        }
                    ]
                }
            },
            hideEmptyFilterValues: true
        };
        console.log("Generated characteristics!" );
        return characteristics as AlCardstackCharacteristics;
    }
}
