import { ErrorService } from "./error.service";


/**
 * ErrorService
 */
describe('Error service Test Suite', () => {

    let service: ErrorService = new ErrorService();
    let defaultMessage: string = "An internal error occurred while processing your request. Please try again later.  If this error continues, contact Alert Logic Support.";
    let defaultMessages = {
        'exposures': {
            "generic": {
                "error_400": "There was an issue processing your request. Please try again later. If this error continues, contact Alert Logic Support.",
                "error_404": "No results matched your request.  If you believe this is an error, contact Alert Logic Support.",
                "error_403": "You do not have the appropriate user role permission to access this page. If you believe this is an error, contact Alert Logic Support."
            }
        },
        'deployments': {
            "generic": {
                "error_404": "There was an issue processing your request. Please try again later. If this error continues, contact Alert Logic Support."
            }
        }
    };

    /**
     * This function is used to test easier the service function getMessage
     * @param api
     * @param subApi
     * @param key
     * @param expectedMessage the return message expected
     */
    function testGetMessage(api: string, subApi: string, key: string, expectedMessage: string) {
        const result = service.getMessage(api, subApi, key);
        expect(result).toBe(expectedMessage);
    }

    // Check the init variables
    describe('WHEN the service is initialized', () => {
        it('SHOULD check the class public variables values', () => {
            expect(service.messages).toEqual(defaultMessages);
        });
    });

    /**
     * getMessage = ( api, subApi, key )
     */
    describe('WHEN getMessage = ( api, subApi, key ):string is called', () => {
        it('SHOULD return the correct message to show to the customer', () => {
            // generic
            testGetMessage('exposures', 'generic', 'error_400', defaultMessages['exposures']['generic']['error_400']);
        });

        it('SHOULD return the default message to show to the customer', () => {
            testGetMessage('unknow', 'generic', 'error_400', defaultMessage);
        });
    });
});
