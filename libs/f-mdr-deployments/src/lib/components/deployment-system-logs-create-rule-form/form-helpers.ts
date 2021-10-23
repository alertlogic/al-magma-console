
import { AlRule } from '@al/applications';

export const emptyRule: AlRule = {
    scope: null,
    version: null,
    application_id: null,
    account_id: null,
    id: null,
    name: null,
    created: null,
    modified: null,
    config: {
        flatfile: {
            filename: {
                pattern: null
            },
            path: null
        }
    }
};

interface IFormGroup {
    collect:boolean;
    flatfilePath: string;
    flatfilePattern:string;
    ruleName:string;
    formatDateString:string;
    formatDateStringCustom:string;
    patternDateStringCustom:string;
    numberLines:number | string;
    pathKnownPattern:string;
    patternDateString:string;
}

export const emptyFormControl:IFormGroup = {
    collect: true,
    flatfilePath: "",
    flatfilePattern: "",
    ruleName: "",
    formatDateString: "",
    formatDateStringCustom: "",
    patternDateStringCustom: "",
    numberLines: "",
    pathKnownPattern: "",
    patternDateString: "auto",
}

export const formConfiguration = {
    infoName: 'Application name',
    colletMessage: 'Automatically Enable Collection from This Application Log',

    flatfilePathPlaceholder: 'Application File Path',
    flatfilePathTextError: 'A name for the application log is required.',
    infoFlatfilePath: 'The full path to the share or system directory (e.g. /var/www/logs). \
                       The source path is required for appliance-based collection. The system path is required for agent-based collection.',

    flatfilePatternPlaceholder: 'File Name or Pattern',
    flatfileCollectionPolicyPlaceholder: 'File Name Parsing Policy',
    flatfilePatternTextError: 'Filename or pattern could not be empty.',
    infoFlatfilePattern: 'The filename search mask (e.g. sql-errors-*.log).',

    flatfileRotationSchemaLabel: 'File Name Rotation Scheme',
    flatfileRotationSchemaPreDefinedLabel: 'Use a pre-defined timestamp format',
    flatfileRotationSchemaPreDefinedPlaceholder: 'Select a pattern',
    flatfileRotationSchemaPreDefinedInfo: 'The selected file name rotation scheme will apply to the "*" character location \
                                        in the file name to detect the correct rotation scheme. The "*" character must be preceded by a "*" \
                                        character separator. Increasing and decreasing options are only supported by agent version 2.2.0 and above.',

    flatfileRotationSchemaCustomLabel: 'Use a custom timestamp format',

    flatfileRotationSchemaCounterIncreasingLabel: 'Use an increasing counter format',
    flatfileRotationSchemaCounterDecreasingLabel: 'Use a decreasing counter format',

    flatfileRotationSchemaCustomPlaceholder: 'Format of date string',
    flatfileRotationSchemaCustomTextError: 'Format of date string could not be empty.',

    numberLinesPlaceholder: 'Number of lines',
    numberLinesEmptyError: 'Number of lines must be a positive integer.',
    numberLinesIntegerError: 'Number of lines must be a positive integer.',

    pathKnownPatternPlaceholder: 'Pattern',
    pathKnownPatternError: 'Pattern could not be empty.',

    regularEspressionLabel: 'Regular expression',

    muntiLineHandlingTitle: 'Multiline Handling',
    multiLineSingle: 'Single line log messages',
    multiLineMultipleLines: 'Log messages with multiple lines',
    multilineLineCount: 'Each log message spans a fixed number of lines',
    multilineLinePattern: 'Each log message follows a known pattern',

    timestampActual: 'Set message time as collect time',
    timestampPredefined: 'Parse file name using a pre-defined timestamp format',
    timestampCustom: 'Parse file name using a custom timestamp format',
    timestampFormatPlaceholder: 'Select a format',

    timestampCustomPlaceholder: 'Format of date string',
    timestampCustomCustomTextError: 'Format of date string could not be empty.',

    multiline: {
        operator: null,
        continuation: null,
        line_count: null,
        pattern: null,
        is_regex: null,
        is_multiline: false,
    },
    timestamp: {
        format: null,
        rule: 'actual',
    }
};

export const multilineContinuationList = [
    { label: "At the beginning of message" },
    { label: "In the middle of message" },
    { label: "At the end of message" },
]

export const timestampPatterns = [
    { label:"Auto-Detect" },
    { label:"MM-DD-YYYY" },
    { label:"MM-DD-YY" },
    { label:"MM.DD.YYYY" },
    { label:"MM.DD.YY" },
    { label:"MM_DD_YYYY" },
    { label:"MM_DD_YY" },
    { label:"YYYY-MM-DD" },
    { label:"YYYY-MM-DDThh_mm_ss" },
    { label:"YY-MM-DD" },
    { label:"YYYYMMDD" },
    { label:"YYYYMMDD_hh" },
    { label:"YYYYMMDD_hhmmss" },
    { label:"YYMMDDhh" },
    { label:"YYMMDD" },
    { label:"YYMM" },
    { label:"DD-MM-YYYY" },
    { label:"DD-MM-YY" },
    { label:"DD.MM.YYYY" },
    { label:"DD.MM.YY" },
    { label:"DD_MM_YYYY" },
    { label:"DD_MM_YY" },
];

export const timestampFormats = [
    { label:"epoch" },
    { label:"YYYY\/MM\/DD hh:mm:ss" },
    { label:"A DD hh:mm:ss" },
    { label:"DD\/A\/YYYY hh:mm:ss" },
    { label:"DD\/A\/YYYY:hh:mm:ss" },
    { label:"A DD hh:mm:ss (YYYY)" },
    { label:"YYYY\/MM\/DD hh:mm:ss Z1" },
    { label:"A DD hh:mm:ss Z1" },
    { label:"DD\/A\/YYYY hh:mm:ss Z1" },
    { label:"DD\/A\/YYYY:hh:mm:ss Z1" },
    { label:"A DD hh:mm:ss (YYYY) Z1" },
    { label:"YYYY\/MM\/DD hh:mm:ss Z2" },
    { label:"A DD hh:mm:ss Z2" },
    { label:"DD\/A\/YYYY hh:mm:ss Z2" },
    { label:"DD\/A\/YYYY:hh:mm:ss Z2" },
    { label:"A DD hh:mm:ss (YYYY) Z2" },
    { label:"YYYY-MM-DDThh:mm:ss" },
];
