import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'htmlize'
})
export class AlHtmlizePipe implements PipeTransform {
    transform( val:any ): string {
        if ( ! val ) {
            return "";
        }

        let newValue = val.replace(/\n/g, '<br/>');
        newValue = newValue.replace( /(^|[^\/])(www\.[\S]+(\b|$))/gim, '$1<a href="http://$2" target="_blank">$2</a>');
        newValue = newValue.replace( /(\b(https?|ftp|http):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim, '<a href="$1" target="_blank">$1</a>' );

        return `${newValue}`;
    }
}
