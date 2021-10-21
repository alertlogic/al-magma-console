import { Injectable } from '@angular/core';

@Injectable()
export class AlBlobService {

    public donwloadFile( blob:BlobPart, fileName:string) {
        const url = window.URL.createObjectURL(new Blob([blob],{ type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
    }
}
