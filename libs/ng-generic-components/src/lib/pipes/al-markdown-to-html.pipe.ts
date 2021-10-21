import { Pipe, PipeTransform } from '@angular/core';
import showdown from 'showdown';

@Pipe({
    name: 'MarkdownToHtml',
})
export class AlMarkdownToHtmlPipe implements PipeTransform {

    private converter = new showdown.Converter({ openLinksInNewWindow: true });

    public transform(markdown:string):string {
        if (markdown == null) {
            return '';
        }
        this.converter.setOption('tables', true);
        return this.converter.makeHtml(markdown);
    }

}
