/**
 * Created by jtarver on 3/1/17.
 */

import {
    Pipe,
    PipeTransform,
} from '@angular/core';
import { DecodeHexPipe } from './decodeHex.pipe';


@Pipe({ name: 'removeNonPrintable' })
export class RemoveNonPrintablePipe extends DecodeHexPipe implements PipeTransform {

    transform(input:string) {

        const singleByteUnprintable = /[\x00-\x08\x0B\x0C\x0E-\x1F\x80-\xFF]/gmi;
        return input.replace(singleByteUnprintable, '.');

    }
}
