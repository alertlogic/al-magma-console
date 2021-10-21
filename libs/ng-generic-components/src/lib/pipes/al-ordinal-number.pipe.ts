import { Pipe, PipeTransform } from '@angular/core';

const ordinals: string[] = ['th','st','nd','rd'];

/*
 * Append ordinal to number (e.g. "1st" position)
 * Usage:
 *   value | ordinal:keepNumber
 * Example:
 *   {{ 23 |  ordinal}}
 *   formats to: '23rd'
 * Example:
 *   {{ 23 |  ordinal:false}}
 *   formats to: 'rd'
*/
@Pipe({
    name: 'alOrdinalNumber'
})
export class AlOrdinalNumberPipe implements PipeTransform {

    transform(n: number | string, keepNumber: boolean = true): string {
        let x = n;
        if (typeof n === "string"){
            x = parseInt(n, 10);
            if ( isNaN(x) ) {
                return n;
            }
        } else if (typeof n !== "number"){
            return n;
        }
        if (typeof x !== "number"){
            return `${n}`;
        }

        const v:number = x % 100;
        return (keepNumber?n:'') + (ordinals[(v-20)%10]||ordinals[v]||ordinals[0]);
    }
}
