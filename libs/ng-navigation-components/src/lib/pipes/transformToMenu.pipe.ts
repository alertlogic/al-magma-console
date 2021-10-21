import { AlRoute } from '@al/core';
import {
    Pipe,
    PipeTransform,
} from '@angular/core';
import { MenuItem } from 'primeng/api';

function dispatch(route: AlRoute) {
    route.dispatch();
}

@Pipe({name: 'transformToMenu'})
export class TransformToMenu implements PipeTransform {
  transform(value: AlRoute[]): MenuItem[] {
    let menuItems:MenuItem[] = [];
    if(value){
      value.forEach((item, i)=>{
        if(item.visible){ // To restrict the items visibility
            menuItems.push({
                id: `${item.parent.properties.menuId}--${i}`,
                label: item.caption,
                command: ($event) => dispatch(item),
            });
        }
      });
    }
    return menuItems;
  }
}

