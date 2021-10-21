import { Injectable } from '@angular/core';

@Injectable()
export class AlFileDownloadService {

    public downloadFile(fileName:string, data:string, contentType: string = 'text/csv') {
        const blob = new Blob(['\ufeff' + data], { type: `${contentType};charset=utf-8;` });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.setAttribute("href", url);
        downloadLink.setAttribute("download", fileName);
        // Hide this link.
        downloadLink.style.visibility = "hidden";
        document.body.appendChild(downloadLink);

        // For safari open a new window to save the file.
        if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
            downloadLink.setAttribute("target", "_blank");
        }

        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
}
