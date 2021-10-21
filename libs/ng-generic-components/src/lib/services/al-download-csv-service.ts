/**
 * Downloads blob data as a csv file.
 */
import { Injectable } from '@angular/core';

@Injectable()
export class AlDownloadCsvService {
    /**
     * This will download the string data as a cvs file.
     * @param data The text to put in the file.
     */
    public downloadFile(fileName:string, data:string) {
        const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
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
