import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import Ipaddr from 'ipaddr.js';

@Injectable()
export class InsightUtilityService {

    /**
     *  @property _threatMap This is a map of raw CVSS thresholds -> logical risk levels.  See getThreatLevelFromAsset to see how it should be used.
     */

    _threatMap: any = [{
        threshold: 7,
        level: 3,
        code: 'high',
        label: 'Critical'
    }, {
        threshold: 4,
        level: 2,
        code: 'medium',
        label: "Medium Risk"
    }, {
        threshold: 0.0000001,
        level: 1,
        code: 'low',
        label: "Low Risk"
    }, {
        threshold: 0,
        level: 0,
        code: 'none',
        label: "No Risk"
    }];

    constructor() {
    }

    /**
     * Retrieves the account ID component of an AWS ARN.  See http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html#genref-arns for reference.
     *
     * @param {string} arn The ARN to extract account information from.
     *
     * @returns {string} The account ID (without hyphens), or null if no account ID can be extracted.
     */
    public getAWSAccountFromARN(arn: string): string {
        if (!arn || typeof (arn) !== 'string') {
            return null;
        }
        var elements = arn.split(":");
        if (elements.length < 5) {
            return null;
        }
        return elements[4];
    }

    /**
     * Gets a reference to the service's _threatMap property.
     * @returns {object} a reference to the threat map defined above; see getThreatLevelFromAsset.
     */
    public threatMap() {
        return this._threatMap; /*  Occam says: do not duplicate objects unnecessarily */
    }

    /**
     * Uses an asset definition's threatiness property to determine its logic threat level.
     *
     * @param {object} asset The asset to determine the threat level for; note that this asset must have a 'threatiness' property.
     *
     * @returns {object} An object describing the asset's threat level.  This object will have 'code' and 'label' properties.
     */
    public getThreatLevelFromAsset(asset) {
        /** Lets handle both threat level or threatiness
          * in each case of presence
        **/

        // this var will hold the value that is gonna be
        // used as indicator of threat level or threatiness
        var indicator = asset.threatiness || 0.0;
        var attribute = "threshold";
        if (asset.threat_level) {
            indicator = asset.threat_level || 0;
            attribute = "level";
        }
        var threatMap = this.threatMap();

        for (let i in threatMap) {
            if (indicator >= threatMap[i][attribute]) {
                return threatMap[i];
            }

        }
        return threatMap[threatMap.length - 1];
    }

    /**
     * nestedGet
     * Safely retrieves a deep property from a nested object.
     *
     * @param {object} object The object to begin retrieval from;
     * @param {string} propertySequence A period-delimited list of properties to retrieve;
     * @param {anything} defaultValue The value to return if the property does not exist.
     *
     * Example usage: var value = nestedGet( deploymentConfig, "config.aws.scope.include", [] );
     * If deploymentConfig contains deploymentConfig.config.aws.scope.include, that property will be returned.
     * If it does not, the empty array will be returned instead.
     */
    public nestedGet(object, propertySequence, defaultValue) {
        let properties = propertySequence.split(".");
        let cursor = object;
        for (let i in properties) {
            if (properties[i]) {
                if (typeof (cursor) !== 'object') {
                    return defaultValue;
                }
                if (!cursor.hasOwnProperty(properties[i])) {
                    return defaultValue;
                }
                cursor = cursor[properties[i]];
            }
        }
        return cursor;
    }

    public getscanStatusVpc(summaryVpc: any) {
        let percentage = 0;
        if (!summaryVpc) {
            return 100;
        }
        if (summaryVpc.scanned === 0 && summaryVpc.scannable === 0) {
            percentage = 100;
        } else if (summaryVpc.scannable === 0) {
            percentage = 0;
        } else {
            percentage = ((summaryVpc.scanned * 100) / summaryVpc.scannable);
        }
        return percentage;
    }

    public getScanClass = function (scanStatus: any) {

        let scanStatusClass = "scan-status-2";

        if (scanStatus === 100) {
            scanStatusClass = "scan-status-0";
        } else if (scanStatus >= 50) {
            scanStatusClass = "scan-status-1";
        } else {
            scanStatusClass = "scan-status-2";
        }
        return scanStatusClass;
    };

    public getPolicyType = function (deploymentMode: string) {

        let policyType = 'iam';

        if (deploymentMode === 'none') {
            policyType = 'none';
        }

        return policyType;
    };

    /**
     * logError
     * Show the error in console.
     *
     * @param {object} err exception form the subscribe
     * @param {string} text text to show
     *
     */
    public logError(err: any, text: string = '') {
        if (!text) {
            text = 'An error occurred while attempting to communicate with the server: ';
        }
        throw new Error(text + err);
    }

    /**
     * trimValidator
     * FormControl validator which checks if a text input is an empty string
     */
    public trimValidator = function (control: FormControl) {
        if (typeof control.value === 'string') {
            return (control.value.trim() === '') ? { emptyString: { value: true } } : null;
        } else {
            return { emptyString: { value: true } };
        }
    };

    public ipValidator = function(control: FormControl) {
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(control.value)) {
            return null;
        } else {
            return { validIp: { value: true } };
        }
    };

    public dnsNameValidator = function(control: FormControl) {
        let dnsName: string = control.value ? control.value : '';
        if (/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(dnsName) && (dnsName.indexOf('.') !== -1)) {
            return null;
        } else {
            return { validDnsName: { value: true } };
        }
    };

    public portsValidator = function (control: FormControl, multiValues: boolean = false) {
        // Regex for: range or single ports (eg. 443, 1024:3305, 1024-3305)
        let regex = /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])((:|-)([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/g;

        let portsList: string[] = [];
        let rawValue: string = "";
        let valid: boolean = true;
        if (control && control.value) {
            rawValue = control.value;
            portsList = rawValue.split(',');
        }

        const getValidityPortRange = (portRange: string): boolean => {
            const isRange: boolean = portRange.includes(':') || portRange.includes('-');
            if (isRange) {
                const separator: string = portRange.includes(':') ? ':' : '-';
                const value1: number = parseInt(portRange.split(separator)[0], 10);
                const value2: number = parseInt(portRange.split(separator)[1], 10);
                return value1 < value2;
            }
            return true;
        };

        if (portsList.length > 0 && multiValues) {
            portsList.forEach( rawPort => {
                if (!(rawPort && rawPort.trim().match(regex) && valid)) {
                    valid = false;
                } else {
                    valid = getValidityPortRange(rawPort);
                }
            });
            return valid ? null : { invalidPort: { value: true } };
        }

        if (!multiValues) {
            const port: string = portsList.length === 1 ? portsList[0].trim() : "";
            valid = (port.match(regex) !== null && getValidityPortRange(port)) || port === "*";
        }

        return valid ? null : { invalidPort: { value: true } };

    };

    /**
     * cidrValidator
     * FormControl validator for checking a valid CIDR
     */
    public cidrValidator = function (allowAsterisk: boolean = false, allowComas: boolean = false, required: boolean = true) {
        return function (control: FormControl) {
            if (!control.value && !required) { return null; }
            if (typeof control.value === 'string') {
                let cidrFormatRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
                let cidr = control.value;
                let validFormat: boolean = false;
                let cidrs: Array<string> = [];
                let ip, networkCIDR = "";
                if (cidr === '*' && allowAsterisk) {
                    return null;
                }
                let _verifyCIDR = function (cidrParam: string) {
                    validFormat = cidrFormatRegex.test(cidrParam) && (/^(.+)\/(\d+)$/).test(cidrParam);
                    if (cidrParam && validFormat) {
                        ip = String(Ipaddr.IPv4.parseCIDR(cidrParam)[0]);
                        networkCIDR = String(Ipaddr.IPv4.networkAddressFromCIDR(cidrParam));
                        return (ip === networkCIDR);
                    } else {
                        return false;
                    }
                };
                if (allowComas && cidr.search(',') !== -1) {
                    cidrs = cidr.split(',');
                    for (let cidrItem of cidrs) {
                        if (!_verifyCIDR(cidrItem.trim())) {
                            return { cidrValidity: { value: 'invalid' } };
                        }
                    }
                    return null;
                } else {
                    return _verifyCIDR(cidr) ? null : { cidrValidity: { value: 'invalid' } };
                }
            } else {
                return { cidrValidity: { value: 'invalid' } };
            }
        };
    };

    /**
     * daysOfMonth It validate all of separated values by comma,
     * those must be a number between 1 and 31
     */
    public daysOfMonth = function (control: FormControl) {
        if (typeof control.value === 'string') {
            let pieces = (control.value as string).split(',');
            let valid = true;
            pieces.forEach((piece: string) => {
                let number = Number(piece.trim());
                valid = valid && ((number > 0) && (number <= 31));
            });
            let result = {
                daysOfMonth: true,
                items: pieces
            };
            if (!valid) {
                return result;
            } else {
                return null;
            }
        }
        return null;
    };

    /**
     * Convert bytes to KB, MB, GB, TB, PB
     *
     * @param bytes Bytes to convert
     * @param decimals Numbers of decimals to convert, 2 decimal by default
     */
    public bytesToSize(bytes: any, decimals: number = 2) {
        var sz = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        var factor = Math.floor(((bytes.toString().length) - 1) / 3);
        return (bytes / Math.pow(1024, factor)).toFixed(2) + sz[factor];
    }

    /**
     * ALUtilityService.assert
     *
     * Allows a condition to be validated and handles unexpected condition results to be
     * handled gracefully using several predefined methods.
     *
     * @param {mixed} assertion A literal value, function, or object containing multiple literal values or functions, to be evaluated.
     * @param {mixed} onAssertFailure Instructino on how to handle assertion failures.
     *                  If all of the conditions are met, the method will simply return true.
     *                  If it is a function, it will be called on assertion failure and its result will be returned to the caller.
     *                  If it is a string literal, an exception will be thrown with that text.
     *                  Otherwise, the function will return false.
     *
     *  Examples:
     *
     *  Throws an error if var value is false
     *  ALUtilityService.assert( value !== false, "Expected value not to be false" );
     *
     *  Calls a logging function with a parameter if var value is false, using a callback to test.
     *  ALUtilityService.assert( function( result ) { return value !== false; }, function( parameter ) { console.log("Expected %s not to be false", parameter ); }, "value" );
     *
     *  Executes a series of tests and handles a false response manually.
     *  var expectations = {
     *       "value should not be false": value !== false,
     *       "value should be true": value === true,
     *       "Kevin should equal 'kevin'": 'kevin' === 'kevin'
     *  };
     *
     *  if ( ! ALUtilityService.assert( expectations ) ) {
     *      //  handle error here
     *  }
     */
    public assert = function (assertion: any, onAssertionFailure: any, asset): boolean {
        let assertValue;
        let matrix = {};
        if (typeof (assertion) === 'object') {
            let result = true;
            for (let testKey in assertion) {
                if (assertion.hasOwnProperty(testKey)) {
                    let test = assertion[testKey];
                    matrix[testKey] = this.assert(test, false, asset);
                    result = result && matrix[testKey];
                }
            }
            assertValue = result;
        } else if (typeof (assertion) === 'function') {
            assertValue = assertion();
        } else {
            assertValue = assertion;
        }
        if (!assertValue) {
            if (typeof (onAssertionFailure) === 'function') {
                let parameters = Array.prototype.slice.call(arguments, 2);
                if (typeof (assertion) === 'object') {
                    parameters.push(matrix);
                }
                return onAssertionFailure.apply(null, parameters);
            } else if (typeof (onAssertionFailure) === 'string') {
                throw new Error(onAssertionFailure);
            } else {
                return false;
            }
        }
        return true;
    };
}

