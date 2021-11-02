

import { AlFimConfiguration } from '@al/fim'

export const emptyFormControl = {
    baseDirectoryPath: '',
    pattern: '',
    monitor: false
}

export const emptyConfiguration: AlFimConfiguration = {
    id: null,
    type: null,
    base: null,
    pattern: null,
    description: null,
    enabled: false,
    version: 0,
    recursive: false,
    operations: [],
    scope: [],
    created: {at: null, by: null, at_iso: null},
    modified: {at: null, by: null, at_iso: null}
}
