export class FilterUtilityServiceMock{
    constructor(  ){}

    prepareRemediationItemByIdQueryParam(deploymentId:string, remediationItemId:string,state:string, includeExposures:boolean) {
        
        return {
            detailed_filters: true,
            state: state,
            details:true,
            remediation_item_ids:remediationItemId,
            ...( deploymentId !== "" && {deployment_ids: deploymentId} ),
            ...( includeExposures && { include_exposures:true } )
        };
    }
}
