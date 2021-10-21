import { Pipe, PipeTransform } from '@angular/core';
import { searchableItem } from '../types';

@Pipe({
    name: 'AlFilterList'
})
export class AlFilterListPipe implements PipeTransform {

    transform<T>(items: searchableItem<T>[], searchTerm: string | number): searchableItem<T>[] {
        if (!items) {
            return [];
        }
        if (!searchTerm) {
            return items;
        }
        const exactMatch: boolean = typeof (searchTerm) === 'number';
        return items.filter((item: searchableItem<T>): boolean => {
            return item.searchableVals.some(val =>
                 (exactMatch && val as number === searchTerm as number)
                    || !exactMatch && (new RegExp(searchTerm as string, 'i').test(val as string)));
        });
    }
}

