import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class IconService {

	constructor(private http:HttpClient) { }

	icons!:any[];
	selectedIcon:any;
	apiUrl="assets/demo/data/icons.json";

	getIcons() {
		return this.http.get(this.apiUrl).pipe(map((response:any)=>{
		this.icons=response.icons;
		return this.icons;
		}));
	}

	getIcon(id:any){
		if (this.icons) {
			this.selectedIcon=this.icons.find(x => x.properties.id === id) as Object;
			return this.selectedIcon;
		}
	}

}
