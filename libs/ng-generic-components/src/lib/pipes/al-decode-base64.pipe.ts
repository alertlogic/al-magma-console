/**
 * Created by jtarver on 3/1/17.
 */

import {
    Pipe,
    PipeTransform,
} from '@angular/core';

@Pipe({ name: 'AlDecodeBase64' })
export class AlDecodeBase64Pipe implements PipeTransform {
    transform(input: string):string {
        return atob(input);
    }
}
