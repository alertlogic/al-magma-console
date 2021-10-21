/**
 * A simple mock of the download csv service
 */
import { Injectable } from '@angular/core';

@Injectable()
export class AlDownloadCsvServiceMock {
    public downloadFile(fileName:string, data:string) {}
}
