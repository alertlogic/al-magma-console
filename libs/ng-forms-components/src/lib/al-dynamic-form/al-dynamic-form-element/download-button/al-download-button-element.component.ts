import { Component, Input, OnInit } from '@angular/core';
import {
    AlDefaultClient,
    AlLocation,
 AlSession
} from '@al/core';

@Component({
    selector: 'al-download-button-element',
    templateUrl: './al-download-button-element.component.html',
    styleUrls: ['./al-download-button-element.component.scss']
})
export class AlDownloadButtonElementComponent implements OnInit {
    @Input() label: string = '';
    @Input() url: string = '';
    @Input() replace: { [key: string]: string } = {};

    copyUrl: string = '';

    ngOnInit(): void {
        this.copyUrl = this.url;
    }

    download() {
        AlDefaultClient.get({
            version: this.getVersion(),
            service_stack: AlLocation.DistributorAPI,
            account_id: AlSession.getActingAccountId(),
            path: this.getPath(),
            withCredentials: false,
            responseType: 'arraybuffer',
            headers: { Accept: "application/octet-stream" }
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'AlertLogic-AWSNetworkFirewallRules.zip');
            document.body.appendChild(link);
            link.click();
          });
    }

    getPath() {
        let i = this.copyUrl.indexOf('{ui.account_id}');
        return this.copyUrl.substring(i + '{ui.account_id}'.length + 1);
    }

    getVersion() {
        let match = this.copyUrl.match(/\/v([0-9]+)\//);
        if (match) {
            return `v${match[1]}`;
        }
        return 'v1';
    }
}
