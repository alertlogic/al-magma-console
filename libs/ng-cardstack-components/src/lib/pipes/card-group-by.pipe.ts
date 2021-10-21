import {
    AlCardstackItem,
    AlCardstackPropertyDescriptor,
    AlCardstackValueDescriptor,
} from "@al/core";
import {
    Pipe,
    PipeTransform,
} from '@angular/core';
import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';
import sortBy from 'lodash/sortBy';

@Pipe({
    name: 'cardGroupBy'
})
export class CardGroupByPipe implements PipeTransform {

    transform<T>(cardsIn: AlCardstackItem<T>[], groupByParam: AlCardstackPropertyDescriptor | null): Array<{ groupByValue?: string; cards: AlCardstackItem<T>[] }> {
        if (!groupByParam) {
            return [{ cards: cardsIn }];
        }

        const groupCaptions:{[i:string]:AlCardstackValueDescriptor} = keyBy(groupByParam.values, v => v.value as string);

        const grouped:{[i:string]:AlCardstackItem<T>[]} = groupBy(cardsIn, (c:AlCardstackItem<T>) => {
            const value = c.properties[groupByParam.property];
            return groupCaptions[value] ? groupCaptions[value].caption : value;
        });

        return sortBy(Object.entries(grouped).map(([groupByValue, cards]: [string, AlCardstackItem<T>[]]) => ({ groupByValue, cards })), 'groupByValue');
    }

}
