import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Suggestion } from './data-models';

interface SuggestionsModel {
  suggestions: Suggestion[]
}


@Injectable({
  providedIn: 'root'
})

export class SuggestionsService {

  constructor(private http: HttpClient) {}

  getSuggestions() {
    return this.http.get('assets/demo/suggestions.json')
    .toPromise()
    .then(res => res as SuggestionsModel)
    .then(data => data);
  }

}
