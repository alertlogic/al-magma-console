export interface AssetFilterOption {
    "asset.deployment_id"?: string;
    "asset.type"?: string;
    "asset.vpc"?: string;
    "asset.subnet"?: string;
}
/**
 * Tool for extracting assets from filters structure from Herald
 * https://console.product.dev.alertlogic.com/api/herald/#api-Subscriptions_v2-CreateSubscription
 */
export class AssetFilterUnpacker {

    /**
     * Remember pass as rawConditions the 'and' object from filters attributte
     */
    constructor( public rawConditions:any ) {
        if ( typeof( rawConditions ) !== 'object' || rawConditions === null ) {
            throw new Error("Invalid input: rawConditions must be an object with at least one property." );
        }
    }

    extractAssets():any[] {
        let firstOr = this.seekFirst( ( operator, data ) => operator === 'or' && this.isArrayOf( data, 'and' ) );
        let assets:any[] = [];
        if ( firstOr && Array.isArray(firstOr) && firstOr.length === 1) {
            firstOr[0].forEach( ( andContainer:any ) => {
                if ( this.isArrayOf( andContainer['and'], '=' ) ) {
                    let asset:any = {};
                    andContainer['and'].forEach( ( equalContainer:any ) => {
                        let equals = equalContainer['='];
                        if ( Array.isArray( equals ) && equals.length === 2 ) {
                            if ( 'source' in equals[0] && typeof( equals[1] ) === 'string' ) {
                                asset[equals[0]['source']] = equals[1];
                            }
                        }
                    } );
                    assets.push( asset );
                }
            } );
        }
        return assets;
    }

    extractAssetsFromOr():any[] {
        let assets:any[] = [];
        if (Array.isArray(this.rawConditions)) {
            const rowAssets = this.rawConditions.filter(
                filter => filter.hasOwnProperty("or") && Array.isArray(filter["or"]) && filter["or"].length > 0
            );
            const uniqueAssets:boolean = rowAssets.length === 1;
            if (uniqueAssets && rowAssets[0].hasOwnProperty("or") && Array.isArray(rowAssets[0]["or"])) {
                rowAssets[0]["or"].forEach(rowAsset => {
                    const isValidAsset = (rowAsset.hasOwnProperty("=") && Array.isArray(rowAsset["="]) && rowAsset["="].length === 2) &&
                                    rowAsset["="][0].hasOwnProperty('source') && (typeof rowAsset["="][1]) === "string";
                    let asset:any = {};
                    const validSources: string[] = ["asset.deployment_id", "asset.subnet", "asset.vpc"];
                    if (isValidAsset) {
                        const sourceType = rowAsset["="][0]["source"];
                        if ((typeof sourceType === "string") && validSources.includes(sourceType)) {
                            asset[sourceType] = rowAsset["="][1];
                            assets.push(asset);
                        }
                    }
                });
            }
        }
        return assets;
    }

    seekAll( callback:{(key:string,value:any):boolean}, data?:any ):any[] {
        if ( ! data ) {
            data = this.rawConditions;
        }
        if ( Array.isArray( data ) ) {
            return data.map( el => this.seekAll( callback, el ) );
        } else if ( typeof( data ) === 'object' && data !== null ) {
            let results:any[] = [];
            Object.entries( data ).forEach( ( [ key, value ] ) => {
                if ( callback( key, value ) ) {
                    results.push( value );
                }
            } );
            return results;
        } else {
            return [];
        }
    }

    seekFirst( callback:{(key:string,value:any):boolean}, data?:any ):any {
        let matches = this.seekAll( callback, data );
        if ( matches.length > 0 ) {
            return matches.filter(match => Array.isArray(match) && match.length !== 0)[0];
        }
        return null;
    }

    isArrayOf( element:any, targetOperator:string ):element is any[] {
        if ( Array.isArray( element ) ) {
            return element.reduce( ( delta, value ) => delta && this.isOperator( value, targetOperator ), true );
        }
        return false;
    }

    isOperator( element:any, targetOperator:string ):boolean {
        if ( typeof( element ) !== 'object' || element === null ) {
            return false;
        }
        const entries = Object.entries( element );
        if ( entries.length !== 1 ) {
            return false;
        }
        const [ operator, data ] = entries[0];

        if ( operator === targetOperator && Array.isArray(data) ) {
            return true;
        }
        return false;
    }
}
