import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'search-controls',
    templateUrl: './search-controls.component.html',
    styleUrls: ['./search-controls.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class SearchControlsComponent {

    getData(searchTxt: string) {
        console.log('OnSearchChanged ', searchTxt);
    }
}
