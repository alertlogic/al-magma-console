import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectValue'
})
export class ObjectValuePipe implements PipeTransform {

  transform(value: any, name: string): any {

    if (Array.isArray(value) || !(value instanceof Object) || !name) {
      return value;
    } else if (name.indexOf('.') > -1) {
      const splitName: string[] = name.split(/\.(.+)/, 2);
      return this.transform(value[splitName[0]], splitName[1]);
    } else {
      return value[name];
    }

  }

}
