import { Pipe, PipeTransform } from '@angular/core';

/*
 * Filters an array of generic items based on a particular
 * value (string|number) and takes the option to be equals or not-equals.
 *
 * @items list of items to filter
 * @propertyPath property path, may be a recursive path e.g. aa.bb.cc
 * @value the value or values (comma separated) we want to filter against
 * @equals boolean will tell if we want to equals or non-equals the comparison
 *
 * Usage:
 *   items | alFilterByValuePipe:'key':'value'
 * Example:
 *   {{ items | alFilterByValuePipe:'type':'asset':false }}
*/
@Pipe({ name: 'alFilterByValuePipe' })
export class AlFilterByValuePipe implements PipeTransform {
    transform<T>(items: T[], propertyPath: string, value: string | number, equals: boolean = true) {
        return items.filter(item => {
            const comparedValue: string = this.nestedGet(item, propertyPath, '');
            const valuesToCompareAgainst: string[] = value.toString().toLowerCase().split(',');
            // Lets filter the value(s) we want to compare against
            let comparedResult: boolean = valuesToCompareAgainst.filter(valueToCompare => comparedValue.toLowerCase().includes(valueToCompare)).length > 0;
            return (equals) ? comparedResult : !comparedResult;
        });
    }

    public nestedGet(object, propertySequence, defaultValue) {
        let properties = propertySequence.split(".");
        let cursor = object;
        for (let i in properties) {
            if (properties[i]) {
                if (typeof (cursor) !== 'object') {
                    return defaultValue;
                }
                if (!cursor.hasOwnProperty(properties[i])) {
                    return defaultValue;
                }
                cursor = cursor[properties[i]];
            }
        }
        return cursor;
    }
}
