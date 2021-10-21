import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'alFilterSuggestionPipe'
})
export class AlFilterSuggestionPipe implements PipeTransform {

    transform(data: { label: string; value: string; description?: string }[], searchKey: string): { label: string; value: string; description?: string }[] {
        if (!data) {
            return [];
        }
        if (!searchKey) {
            return data;
        }
        return data.filter(item => {
            const search = searchKey.toLocaleLowerCase();

            return item.label.toLocaleLowerCase().includes(search)
                || item.value.toLocaleLowerCase().includes(search);
        });
    }
}
