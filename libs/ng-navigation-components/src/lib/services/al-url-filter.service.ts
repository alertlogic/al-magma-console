import { Injectable } from '@angular/core';
import { AlNavigationService } from './al-navigation.service';
import { NavigationExtras, Router, Params, ActivatedRoute } from '@angular/router';

@Injectable()
export class AlUrlFilterService {

    private whiteList:string[] = [];
    private filterObj:{[i:string]:string};

    constructor( public navigationService:AlNavigationService,
                 public router:Router,
                 public route:ActivatedRoute ){

    }

    public set whitelist( whitelist:string[] ){
        this.whiteList = whitelist;
    }

    public get whitelist():string[]{
        return this.whiteList;
    }

    public set filters(filterObj: { [i: string]: string }) {
        for (const key in filterObj) {
            if (filterObj.hasOwnProperty(key) && !this.whiteList.includes(key) ) {
                delete filterObj[key];
            }
        }
        this.filterObj = filterObj;
    }

    public get filters():{[i:string]:string}{
        return this.filterObj;
    }

    /**
     * Take a Params object and return a new object with the filters present
     * in the whitelist if they exist
     */
    public getFiltersFromQueryParams( queryParams:Params ):{[i:string]:string}{
        let filters:{[i:string]:string} = {};
        for (const key in queryParams) {
            if (queryParams.hasOwnProperty(key) && this.whiteList.includes(key) ) {
                filters[key] = queryParams[key];
            }
        }
        return filters;
    }

    /**
     * Apply the setted filters in the URL and route to it
     * Wrapper for O3NavigationService route function
     */
    public routeToUrl( commands:any[], extras:NavigationExtras = {} ):void{
        extras.queryParams = this.filters;
        this.navigationService.navigate.byNgRoute( commands, extras);
    }

    /**
     * Update the current url with the filters
     */
    public updateFiltersInUrl( extras:NavigationExtras = {} ):void{
        let unsettedFilters = this.whiteList.reduce( ( previousValue: {[i:string]:string}, currentValue: string ) => {
            previousValue[currentValue] = null;
            return previousValue;
        },{});

        this.filterObj = Object.assign( unsettedFilters , this.filterObj );

        extras.relativeTo = this.route;
        extras.queryParamsHandling = "merge";
        extras.queryParams = this.filters;

        let newLocation:string = '/#' + this.router.createUrlTree([], extras ).toString();
        this.navigationService.navigate.byURL( newLocation, {}, {replace: true});
    }


    // The next methods are being used being used by Exposure and Health apps due to the similarities in their filter management

    /**
     * Takes an array of filters ["key0:value0","key1:value1",...] and return
     * an object { "key0":"value0", "key1":"value1" }
     */
    public fromSelectedFilters( selectedFilters:string[] ):{[i:string]:string}{

        return selectedFilters.reduce( ( previousValue: {[i:string]:string}, currentValue:string )=>{
            let f:string[] = currentValue.split(":");
            previousValue[f[0]] = f[1];
            return previousValue;
        },{});
    }

    /**
     * Takes an object { "key0":"value0", "key1":"value1" } and return
     * an array of filters like: ["key0:value0","key1:value1",...]
     */
    public toSelectedFilters( filters:{[i:string]:string} ):string[] {
        return Object.entries(filters).map(([key,value])=>`${key}:${value}`);
    }

}
