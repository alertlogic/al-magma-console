import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'containsPipe'
})
export class ContainsPipe implements PipeTransform {

    transform(data: string, searchKey: string): boolean {
        return !!data && !!searchKey && data.toLocaleLowerCase().includes(searchKey.toLocaleLowerCase());
    }
}
