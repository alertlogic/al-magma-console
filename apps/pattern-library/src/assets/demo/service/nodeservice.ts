import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


export interface TreeNode {
  data?: any;
  children?: TreeNode[];
  leaf?: boolean;
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NodeService {

    constructor(private http: HttpClient) { }

    getFiles() {
    return this.http.get<any>('assets/demo/data/files.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
    }

    getLazyFiles() {
    return this.http.get<any>('assets/demo/data/files-lazy.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
    }

    getFilesystem() {
    return this.http.get<any>('assets/demo/data/filesystem.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
    }

    getLazyFilesystem() {
    return this.http.get<any>('assets/demo/data/filesystem-lazy.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
    }
}