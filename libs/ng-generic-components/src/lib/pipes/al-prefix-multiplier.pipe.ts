import { Pipe, PipeTransform } from '@angular/core';

/* Prefix Multiplier Pipe
 *  Transforms numbers to its prefix multiplier form
 *  Update: now you can use it to transform bytes too.
 *
 *  {{ 1000 | alPrefixMultiplier }} will output 1k
 *  {{ 1500 | alPrefixMultiplier }} will output 1.5k
 *  {{ 7800 | alPrefixMultiplier }} will output 7.8k
 *  {{ 800 | alPrefixMultiplier: true }} will output 800B
 *  {{ 7800 | alPrefixMultiplier: true }} will output 7.8KB
 *  {{ 66599818 | alPrefixMultiplier: true }} will output 66.5MB
 */

@Pipe({
    name: 'alPrefixMultiplier'
})
export class AlPrefixMultiplierPipe implements PipeTransform {
    transform(val: any, fromBytes: boolean = false): string {
        if (!val && val !== 0) {
            return "";
        }

        let n = parseInt(val, 10);
        if (isNaN(n)) {
            return val;
        }

        let symbol: string = fromBytes? "B" : "";
        let value: number = 1;
        let newString: string = n.toString();

        if (n >= 1000 && n < 1000000) {
            value = 1000;
            symbol = fromBytes? "KB" : "k";
        } else if (n >= 1000000 && n < 1000000000) {
            value = 1000000;
            symbol = fromBytes? "MB" : "m";
        } else if (n >= 1000000000 && n < 1000000000000) {
            value = 1000000000;
            symbol = fromBytes? "GB" : "g";
        } else if (n >= 1000000000000) {
            value = 1000000000000;
            symbol = fromBytes? "TB" : "t";
        }

        if (value !== 1) {
            let number = Math.floor((n / value) * 10) / 10; // Get the number with the first decimal
            newString = number + symbol;
        }

        return newString;
    }
}
