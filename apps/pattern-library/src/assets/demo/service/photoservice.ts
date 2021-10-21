import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Image } from '../domain/image';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

    constructor(private http: HttpClient) { }

    getImages() {
    return this.http.get<any>('assets/demo/data/photos.json')
      .toPromise()
      .then(res => <Image[]>res.data)
      .then(data => { return data; });
    }
}