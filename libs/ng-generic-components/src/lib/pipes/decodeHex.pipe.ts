/**
 * Created by jtarver on 3/1/17.
 */

import {
    Pipe,
    PipeTransform,
} from '@angular/core';

import { DecodeService } from '../services/decode.service';


@Pipe({ name: 'decodeHex' })
export class DecodeHexPipe implements PipeTransform {
    transform(input:string):string {
        return DecodeService.decodeHex(input);

    }
}
