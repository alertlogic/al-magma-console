import {
    Pipe,
    PipeTransform,
} from '@angular/core';

@Pipe({ name: 'newlinesplit' })
export class NewlineSplitPipe implements PipeTransform {
    public transform(value:string):string[] {
        if (!value) {
            return [value];
        }

        if (/\r\n/.test(value)) {
            return value.split(/\r\n/);
        }
        if (/\r/.test(value)) {
            return value.split(/\r/);
        }
        return value.split(/\n/);
    }
}
