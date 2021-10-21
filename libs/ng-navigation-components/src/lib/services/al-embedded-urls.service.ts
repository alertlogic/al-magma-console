import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpParams } from "@angular/common/http";
import { AlLocation, AlLocatorService, AlSession } from '@al/core';

@Injectable()
export class AlEmbeddedUrlsService {

    private resourcesMap: { [key: string]: string } = {
        "list": "exposures.php",
        "host": "host.php",
        "hostdetails": "reports/pdf/host_details.php",
        "pciedit": "pci_scan_edit.php",
        "edit": "scan_edit.php",
        "add": "scan_add.php",
        "pciadd": "pci_scan_add.php",
        "pciresults": "reports/pci_scan_results.php",
        "exec_summary": "reports/pci_scan_exec_summary.php",
        "vuln_details": "reports/pci_scan_vuln_details.php",
        "attestation": "reports/pci_attestation_contact_form.php",
        "asvpci": "resources/alert_logic_disclosures_regarding_ASV_PCI_scans.pdf"
    };

    private nonRequiredParams: string[] = ["aaid", "locid"];

    constructor(public sanitizer: DomSanitizer) { }

    /**
     *  Retrieves the url for Summary embedded
     */
    getSummaryEmbeddedUrl(accountId: string, product: string): SafeResourceUrl {
        return this.trust(AlLocatorService.resolveURL(AlLocation.LegacyUI) + '/' + product
            + '/summary/embedded?customer_id=' + accountId
            + '&aims_token=' + encodeURIComponent(AlSession.getToken()));
    }

    /**
     *  Retrieves the url for Messages embedded
     */
    getMessagesEmbeddedUrl(accountId: string): SafeResourceUrl {
        return this.trust(AlLocatorService.resolveURL(AlLocation.LegacyUI)
            + 'lm/messages/embedded?customer_id=' + accountId
            + '&aims_token=' + encodeURIComponent(AlSession.getToken()));
    }

    /**
     *  Retrieves the url for Web Security Dashboard embedded
     */
    getWebSecurityDashboardEmbeddedUrl(accountId: string): SafeResourceUrl {
        return this.trust(AlLocatorService.resolveURL(AlLocation.LegacyUI)
            + '/websec/summary/embedded?customer_id=' + accountId
            + '&aims_token=' + encodeURIComponent(AlSession.getToken()));
    }

    /**
     *  Retrieves the url for WAF Overview embedded
     */
    getWAFDashboardEmbeddedUrl(accountId: string): SafeResourceUrl {
        return this.trust(AlLocatorService.resolveURL(AlLocation.LegacyUI)
            + '/wsm/embedded?customer_id=' + accountId
            + '&aims_token=' + encodeURIComponent(AlSession.getToken()));
    }

    /**
     *  Retrieves the url for a legacy page
     */
    getLegacyEmbeddedUrl(accountId: string, url: string, application: string): SafeResourceUrl {
        return this.trust(AlLocatorService.resolveURL(AlLocation.LegacyUI)
            + '/embedded' + url + '?customer_id=' + accountId
            + '&legacy_embedded=true&application=' + application
            + '&aims_token=' + encodeURIComponent(AlSession.getToken()));
    }

    /**
     *  Retrieves the url for a legacy page passing query string parameters as object (key:value)
     */
    getLegacyURL(resource: string, params: { [key: string]: string }): SafeResourceUrl {
        // lets handle the params and build the queryParams
        // that will be parsed and append to the final URL
        let queryParams = new HttpParams();
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                queryParams = queryParams.set(key, params[key]);
            }
        }
        queryParams = queryParams.set("aims_token", AlSession.getToken());
        return this.trust(AlLocatorService.resolveURL(AlLocation.LegacyUI)
            + '/embedded/' + resource + '?' + queryParams.toString());
    }

    /**
     *  Retrieves the url for a legacy page passing query string parameters as object (key:value)
     */
    getNgURL(resource: string, params: { [key: string]: string }): SafeResourceUrl {
        // lets handle the params and build the queryParams
        // that will be parsed and append to the final URL
        let queryParams = new HttpParams();
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                queryParams = queryParams.set(key, params[key]);
            }
        }
        queryParams = queryParams.set("aims_token", AlSession.getToken());
        return this.trust(AlLocatorService.resolveURL(AlLocation.LegacyUI)
            + '/' + resource + "/embedded" + '?' + queryParams.toString());
    }

    getURLResource(resourceKey: string = "list"): string {
        return this.resourcesMap[resourceKey];
    }

    public cleanUpQueryParams(params: { [key: string]: string }): { [key: string]: string } {
        for (const paramKey of this.nonRequiredParams) {
            if (params.hasOwnProperty(paramKey)) {
                delete params[paramKey];
            }
        }
        return params;
    }

    protected trust(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
