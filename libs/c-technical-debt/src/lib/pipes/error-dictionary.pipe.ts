import { Pipe, PipeTransform } from '@angular/core';

/**
 * ErrorResponsesDictionaryPipe transforms the service, responseCode and responseMessage  in a descriptable message
 *
 * @author Juan Sanchez <juan.sanchez@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2017
 */
@Pipe({
    name: 'errorResponsesDictionary'
})
export class ErrorResponsesDictionaryPipe implements PipeTransform {

    transform(service,responseCode,responseMessage): any {
        let dictionary = {
            "aims": {
                400: {
                    "default": "Bad request",
                    "account_active": "An active account cannot be deleted.",
                    "limit_exceeded": "Cannot create more than 5 access keys.",
                    "password_reuse_prevented": "User cannot be updated because password was already used.",
                    "weak_password": "Cannot perform request due to weak password.",
                    "invalid_json": "Cannot perform request due to invalid/malformed json body.",
                    "invalid_email": "Cannot perform request due to invalid email address.",
                    "invalid_account_name": "Cannot perform request due to invalid account name.",
                    "self_grant_error": "User tried to grant role to itself.",
                    "self_delete_error": "Client used a user to delete itself.",
                    "invalid_role_id": "Cannot perform request due to invalid role ID.",
                    "admin_account_immutable": "Cannot perform request because administrator account is immutable.",
                    "not_enough_administrators": "Cannot delete last Administrator.",
                    "password_expired": "User tried to login with an expired password.",
                    "self_revoke_error": "User tried to revoke role from itself."
                },
                401: {
                    "default": "Forbidden",
                    "forbidden": "Insufficient permissions.",
                    "unauthorized": "Unauthorized permissions."
                },
                403: {
                    "default": "Forbidden",
                    "forbidden": "Insufficient permissions."
                },
                409: {
                    "default": "Forbidden",
                    "user_exists": "An user with one or more of these details already exists."
                },
                410: {
                    "default": "The requested AIMS object (or an associated AIMS object, such as an account has been deleted."
                },
                413: {
                    "default": "The request body size exceeds the configured body size limit which is 1MB."
                },
                404: {
                    "default": "Bad request",
                    "token_expired_or_notfound": "We were unable to reset your password because the token you provided was not found or has expired.",
                    "not_found": "The object was not found."
                }
            },
            "asi": {
                400: {
                    "default": "Bad request",
                    "invalid_email": "Cannot perform request due to invalid email.",
                    "invalid_account_name": "Cannot perform request due to invalid account name.",
                    "invalid_aws_token": "Cannot perform request due to invalid AWS marketplace token.",
                    "aws_token_expired": "Cannot perform request due to expired AWS marketplace token.",
                    "blacklisted_email": "Cannot perform request because email is blacklisted.",
                    "invalid_phone_number": "Cannot perform request due to invalid phone number.",
                    "missing_required_param": "Cannot perform request due to missing required param.",
                    "request_entity_too_large": "The request body size exceeds the configured body size limit which is 1MB."
                },
                409: {
                    "default": "Forbidden",
                    "duplicate_email": "Cannot perform request because email is already in use."
                },
                413: {
                    "default": "Forbidden",
                    "request_entity_too_large": "Request Entity Too Large The request body size exceeds the configured body size limit which is 1MB."
                }
            },
            "cloud_explorer": {
                403:{
                    'iam': "The AWS role you created contains a limited or malformed IAM policy that does not allow us access to your AWS account. For more information click the information icon.",
                    'none': "The AWS role you created contains a limited or malformed IAM policy that does not allow us access to your AWS account. For more information click the information icon.",
                    'x_account_ct': "The AWS role you created contains a limited or malformed IAM policy that does not allow us access to the CloudTrail logs in your AWS account. For more information click the information icon."
                },
                406:{
                    'iam': 
                        "The AWS role you provided is valid, but lacks sufficient privilege to explore your deployment completely or deploy properly. Please click the information icon to review the role and policy creation instructions.",
                    'none': 
                        "The AWS role you provided is valid, but lacks sufficient privilege to explore your deployment completely or deploy properly. Please click the information icon to review the role and policy creation instructions.",
                    'x_account_ct': 
                        "The AWS role you provided is valid, but lacks sufficient privilege to use CloudTrail properly. Please click the information icon to review the role and policy creation instructions."
                },
                401: {
                    "iam": "We could not validate the role. Please check the role permissions and try again.",
                    "none": "We could not validate the role. Please check the role permissions and try again.",
                    'x_account_ct': "We could not validate the role. Please check the role permissions and try again."
                }
            },
            "sources":{
                400:{
                    'credentials_merge':"The AWS role you provided is not compatible.",
                    'sources_merge': "You provided an incorrect AWS role for this deployment. Ensure you entered the correct AWS role for this deployment, and try again."
                }
            },
            "azure_explorer": {
                400:{
                    'azure': "Validation of request parameters failed."
                },
                401:{
                    'azure': "We could not validate the RBAC role. Verify the RBAC role is assigned to an Azure account with administrative permissions."
                },
                403:{
                    "azure": "Validation failed due to insufficient RBAC permissions detected. Please review the policy instructions in the info icon."
                },
                404:{
                    "azure": "Validation failed due to Azure subscription can not be found. Please review the policy instructions in the info icon."
                },
                500: {
                    'default': "An internal error prevented this process from completing."
                }
            },
            "sources_azure": {
                400:{
                    'credentials_merge': "The user you provided is not compatible.",
                    'sources_merge': "An internal error prevented this process from completing. Please try again.",
                    'sources_create': "An internal error happend while we were saving. Please try again."
                },
                500: {
                    'default': "An internal error prevented this process from completing."
                }
            },
            "deployments": {
                400: {
                    'authentication_failed': "We could not create the deployment, because the AWS credentials provided were not correct for this account.",
                    'authorization_failed': "We could not create the deployment, because the AWS account used for the Role ARN does not have Administrator permissions.",
                    'outdated': "This Role ARN uses an outdated policy document. You must edit the policy in AWS and use the current policy document. "
                    +"Click \"AWS Instructions\" on the left navigation and copy the current policy from Step 2.",
                    'bad_request': "Validation of request parameters failed"
                },
                default: {
                    'default': "We could not complete this action. Please try again."
                }
            },
            "herald": {
                400: {
                    'default': "There was an issue processing your request. Please try again later. If this error continues, contact Alert Logic Support."
                },
                403: {
                    'default': "You do not have the appropriate user role permission to access this page. If you believe this is an error, contact Alert Logic Support."
                },
                404: {
                    'default': "No results matched your request. If you believe this is an error, contact Alert Logic Support."
                },
                500: {
                    'default': "An internal error occurred while processing your request. Please try again later. If this error continues, contact Alert Logic Support."
                }
            }
        };
        return dictionary[service][responseCode][responseMessage];
    }

}
