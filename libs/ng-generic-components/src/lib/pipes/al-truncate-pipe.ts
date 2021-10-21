import { Pipe, PipeTransform } from '@angular/core';

/**
 * let longStr = 'A really long text which needs to be truncated';
 * {{longStr | AlTruncate }}
 * Output: A really long text which needs to be truncated
 * {{longStr | AlTruncate : 12 }}
 * Output: A really lon...
 * {{longStr | AlTruncate : 12 : true }}
 * Output: A really...
 * {{longStr | AlTruncate : 12 : false : '***' }}
 * Output: A really lon***
 */

@Pipe({
  name: 'AlTruncate'
})
export class AlTruncatePipe implements PipeTransform {
    transform(value: string, limit = 100, wordBreak = false, ellipsis = '...') {
        if (wordBreak) {
            limit = value.substr(0, limit).lastIndexOf(' ');
        }
        return value && value.length > limit ? value.substr(0, limit) + ellipsis : value;
    }
}
