import { Injectable } from '@angular/core';

@Injectable()
export class ExposureUtilityService {
    /**
     * getOptionalField function.
     *
     * if we are Disposing/Concluding Remediations/Exposures,
     * we need to use vulnerability_ids (Exposures) or remediation_ids (Remediations).
     *
     * @param page Exposures/Remediations.
     * @param itemIds Remediation or Exposure Ids.
     */
    public getOptionalField( page:string, itemIds:any[] ) {
        if( page === "exposures" ) {
            return { vulnerability_ids: itemIds };
        } else {
            return { remediation_ids: itemIds };
        }
    }
}
