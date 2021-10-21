import { Pipe, PipeTransform } from '@angular/core';
import { AlUiFilterValue } from '../al-filter/al-filter-descriptor.type';

@Pipe({
    name: 'filterListBySearchPipe'
})
export class FilterListBySearchPipe implements PipeTransform {

    transform(data: AlUiFilterValue[], searchText: string):AlUiFilterValue[]  {
        if (!data || ! searchText || searchText.length < 1 ) {
            return data;        //  no worky
        }

        let matcher:RegExp;
        try {
            matcher = new RegExp( searchText, 'i' );
        } catch( e ) {
            return data;
        }

        return data.filter( v => matcher.test( v.caption ) );
    }
}
