import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removewhitespace'
})
export class RemoveWhitespacePipe implements PipeTransform {


  transform(text: string): string {
    if (!text || !text.length) { return text; }
    
    return text.replace(/\s/g, '_');
  }

}
