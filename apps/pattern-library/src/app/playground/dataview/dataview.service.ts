import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Incident {
  id:           string,
  date:         string,
  threatRating: {value: number, rating: string, icon: string},
  summary:      string,
  class:        string,
  attacker:     string,
  target:       string,
  account:      string,
  deployment:   string
}


@Injectable({
    providedIn: 'root'
})

export class DataViewService {

  constructor(private http: HttpClient) {}

  getData() {
    return this.http.get('assets/demo/incident-list.json')
      .toPromise()
      .then(res => res as Incident[])
      .then(data => data);
  }
}