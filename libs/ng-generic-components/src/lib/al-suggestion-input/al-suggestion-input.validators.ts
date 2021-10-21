/**
 * @author Andres Echeverri <andres.echeverri@alertlogic.com>
 * @copyright 2020 Alert Logic, Inc.
 */

import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

function isEmptyInputValue(value: any): boolean {
    // we don't check for string here so it also works with arrays
    return value == null || value.length === 0;
}
// @dynamic
export class AlSuggestionInputValidators {

    static validSuggestions(suggestions: string[], specialCharacter: string = ""): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (isEmptyInputValue(value) || isEmptyInputValue(suggestions)) {
                return null;
            }

            if (specialCharacter === "") {
                if (!suggestions.includes(value.trim())) {
                    return { 'validSuggestions': { wrongSuggestions: [value], 'actualSuggestions': suggestions } };
                }
                return null;
            } else {
                const patt = `${specialCharacter}([^%]*)${specialCharacter}`;
                const expression = new RegExp(patt, 'g');
                let match: RegExpExecArray | null;
                let errors: string[] = [];
                while (match = expression.exec(value)) {
                    const suggestion = value.substring(match.index + 1, expression.lastIndex - 1);
                    if (suggestion === "") {
                        errors.push(suggestion);
                    } else if (!suggestions.includes(suggestion)) {
                        errors.push(suggestion);
                    }
                }
                if (errors.length > 0) {
                    return { 'validSuggestions': { wrongSuggestions: errors, 'actualSuggestions': suggestions } };
                }
                return null;
            }
        };
    }
}
