import { AlOptionItem } from './../types/al-common.types';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: AlOptionItem[], searchTerm: string): any[] {
    if (!items) {
      return [];
    }

    if (!searchTerm) {
      return items;
    }

    return items.filter(item => {
      return item.label.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
    });
  }

}
