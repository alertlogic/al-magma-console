import { FormControl } from "@angular/forms";
import ipaddrJs from 'ipaddr.js';

/**
 * nestedGet
 * Safely retrieves a deep property from a nested object.
 *
 * @param {any} object The object to begin retrieval from;
 * @param {string} propertySequence A period-delimited list of properties to retrieve;
 * @param {any} defaultValue The value to return if the property does not exist.
 *
 * @return {any} The value stored in the property sequence
 * Example usage: var value = nestedGet( deploymentConfig, "config.aws.scope.include", [] );
 * If deploymentConfig contains deploymentConfig.config.aws.scope.include, that property will be returned.
 * If it does not, the empty array will be returned instead.
 */
export function nestedGet(object: any, propertySequence: string, defaultValue: any): any {
    const properties: string[] = propertySequence.split(".");
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

/**
 * Returns a function that sets an "exit fullscreen handler" for a given angular component
 */
export function eventHandlerWhenExitingFullScreen(): (p: any) => void {
    return (component: any) => {
        const exitHandler = () => {
            if (!document['fullscreenElement']) {
                component.fullScreen = false;
                const overlayElement = document.getElementsByClassName('cdk-overlay-container')[0];
                const bodyElement = document.getElementsByTagName('body')[0];
                if (overlayElement) {
                    bodyElement.appendChild(overlayElement);
                }
            }
        };
        document.addEventListener('fullscreenchange', exitHandler);
        document.addEventListener('webkitfullscreenchange', exitHandler);
        document.addEventListener('mozfullscreenchange', exitHandler);
        document.addEventListener('MSFullscreenChange', exitHandler);
    };
}

/**
 * sets the fullscreen mode for agiven HTML element.
 */
export function fullScreen(element: any, isFullScreen: boolean): boolean {
    if (!isFullScreen) {
        const callback = element['requestFullScreen']
            || element['webkitRequestFullScreen']
            || element['mozRequestFullscreen']
            || element['msRequestFullscreen'];
        if (callback) {
            callback.call(element);
        }
        return true;
    } else {
        const callback = document['exitFullscreen'];
        if (callback) {
            callback.call(document);
        }
        return false;
    }
}


/**
 * trimValidator
 * FormControl validator which checks if a text input is an empty string
 */
export function trimValidator(control: FormControl): { emptyString: { value: boolean } } | null {
    if (typeof control.value === 'string') {
        return (control.value.trim() === '') ? { emptyString: { value: true } } : null;
    } else {
        return { emptyString: { value: true } };
    }
}

export function ipValidator(control: FormControl): { validIp: { value: true } } | null {
    /* tslint:disable */
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(control.value)) {
        return null;
    } else {
        return { validIp: { value: true } };
    }
    /* tslint:enable */
}

export function dnsNameValidator(control: FormControl): { validDnsName: { value: boolean } } | null {
    /* tslint:disable */
    let dnsName: string = control.value ? control.value : '';
    if (/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(dnsName) && (dnsName.indexOf('.') !== -1)) {
        return null;
    } else {
        return { validDnsName: { value: true } };
    }
    /* tslint:enable */
}

export function portsValidator(control: FormControl, multiValues: boolean = false): { invalidPort: { value: boolean } } | null {
    // Regex for: range or single ports (eg. 443, 1024:3305, 1024-3305)
    /* tslint:disable */
    let regex = /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])((:|-)([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/g;
    let portsList: string[] = [];
    let rawValue: string = "";
    let valid: boolean = true;
    if (control && control.value) {
        rawValue = control.value;
        portsList = rawValue.split(',');
    }
    /* tslint:enable */

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
        portsList.forEach(rawPort => {
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
}

/**
 * cidrValidator
 * FormControl validator for checking a valid CIDR
 */
export function cidrValidator(allowAsterisk: boolean = false, allowComas: boolean = false, required: boolean = true) {
    return function (control: FormControl): { cidrValidity: { value: string } } | null {
        if (!control.value && !required) { return null; }
        if (typeof control.value === 'string') {
            let cidrFormatRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
            let cidr = control.value;
            let validFormat: boolean = false;
            let cidrs: Array<string> = [];
            let ip: string = '';
            let networkCIDR: string = "";
            if (cidr === '*' && allowAsterisk) {
                return null;
            }
            let verifyCIDR = function (cidrParam: string) {
                validFormat = cidrFormatRegex.test(cidrParam) && (/^(.+)\/(\d+)$/).test(cidrParam);
                if (cidrParam && validFormat) {
                    ip = String(ipaddrJs.IPv4.parseCIDR(cidrParam)[0]);
                    networkCIDR = String(ipaddrJs.IPv4.networkAddressFromCIDR(cidrParam));
                    return (ip === networkCIDR);
                } else {
                    return false;
                }
            };
            if (allowComas && cidr.search(',') !== -1) {
                cidrs = cidr.split(',');
                for (let cidrItem of cidrs) {
                    if (!verifyCIDR(cidrItem.trim())) {
                        return { cidrValidity: { value: 'invalid' } };
                    }
                }
                return null;
            } else {
                return verifyCIDR(cidr) ? null : { cidrValidity: { value: 'invalid' } };
            }
        } else {
            return { cidrValidity: { value: 'invalid' } };
        }
    };
}

/**
 * daysOfMonth It validate all of separated values by comma,
 * those must be a number between 1 and 31
 */
export function daysOfMonth(control: FormControl): { daysOfMonth: boolean, items: string[] } | null {
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
}

/**
 * Convert bytes to KB, MB, GB, TB, PB
 *
 * @param bytes Bytes to convert
 * @param decimals Numbers of decimals to convert, 2 decimal by default
 */
export function bytesToSize(bytes: number): string {
    const sz = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const factor = Math.floor(((bytes.toString().length) - 1) / 3);
    return (bytes / Math.pow(1024, factor)).toFixed(2) + sz[factor];
}

/**
 *  @method getCsvData
 *
 *  It builds a CSV structure data, transforming the data received into an array to
 *  start creating the csv string data.
 *
 *  @param {any} data The json data that it will be translated into CSV.
 *
 *  @returns {string} rawCsv The csv file in string format.
 */
export function getCsvData(data: any): string {
    let arrayData = typeof data !== 'object' ? JSON.parse(data) : data;
    let rawCsv = '';
    let header = "";
    // Getting header
    for (let index in arrayData[0]) {
        if (arrayData[0].hasOwnProperty(index)) {
            header += index + ',';
        }
    }
    header = header.slice(0, -1);
    rawCsv += header + '\r\n';
    // Getting results
    for (let result = 0; result < arrayData.length; result++) {
        let line = '';
        line = '"' + Object.keys(arrayData[result]).map(key => arrayData[result][key].toString().replace(/"/g, '""')).join('","') + '"';
        rawCsv += line + '\r\n';
    }
    return rawCsv;
}
