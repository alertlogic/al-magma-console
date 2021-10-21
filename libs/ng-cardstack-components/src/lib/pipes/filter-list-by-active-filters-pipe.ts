import { AlCardstackValueDescriptor } from '@al/core';
import {
    Pipe,
    PipeTransform,
} from '@angular/core';
import { AlUiFilterValue } from '@al/ng-generic-components';

@Pipe({
    name: 'filterListByActiveFiltersPipe'
})
export class FilterListByActiveFiltersPipe implements PipeTransform {


    transform(data: AlUiFilterValue[], activeFilters:{[valueKey:string]:AlCardstackValueDescriptor}):AlUiFilterValue []  {

        if (!data) {
            return [];
        }

        if (!activeFilters) {
            return data;
        }

        return data.filter( (item) => {
            if (!activeFilters) {
                return true;
            }

            const filteKeys = Object.keys(activeFilters);
            return filteKeys.length > 0 && activeFilters[filteKeys[0]] && activeFilters[filteKeys[0]].value === item.value;
        });

    }
}
