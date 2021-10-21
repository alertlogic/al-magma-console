import { Pipe, PipeTransform } from '@angular/core';
import { AlBaseCardItem } from '@al/ng-cardstack-components';
import { AlCardstackItem } from '@al/core';

@Pipe({
    name: 'baseCardItem'
})
export class BaseCardItemPipe implements PipeTransform {
    transform(item: AlBaseCardItem & AlCardstackItem) {
        item.toptitle = item.properties.toptitle;
        item.countItems = item.properties.countItems;
        item.icon = item.properties.icon;
        return item;
    }
}
