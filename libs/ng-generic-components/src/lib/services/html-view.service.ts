import { Injectable } from '@angular/core';


@Injectable()
export class HtmlViewService {

    public detectHtml(inputString:string):boolean {
        if (!inputString) {
            return false;
        }

        return /<html(.*?)/gi.test(inputString) || /<!doctype(.*?)/gi.test(inputString);
    }

}
