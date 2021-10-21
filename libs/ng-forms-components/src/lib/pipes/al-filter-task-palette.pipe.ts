import { Pipe, PipeTransform } from '@angular/core';
import { AlTaskPaletteItem } from '../types/playbook-action';

@Pipe({
    name: 'alFilterTaskPalettePipe'
})
export class AlFilterTaskPalettePipe implements PipeTransform {

    transform(data: AlTaskPaletteItem[], searchKey: string): AlTaskPaletteItem[] {
        if (!data) {
            return [];
        }
        if (!searchKey) {
            return data;
        }
        return data.filter((item) => {
            const search = searchKey.toLocaleLowerCase();

            return item.label?.toLocaleLowerCase().includes(search)
                || item.name?.toLocaleLowerCase().includes(search);
        });
    }
}
