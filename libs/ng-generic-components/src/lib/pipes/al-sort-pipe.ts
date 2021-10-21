
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'sort'
})
export class AlSortPipe implements PipeTransform {

    transform(data: any[], property: string, direction: string = 'asc'): any[] {
        return data.sort((a: any, b: any) => {
            if (direction === 'asc') {
                return a[property] - b[property];
            }
            return b[property] - a[property];
        });
    }
}
