// Page Names And Status Variables
const EXPOSURES = 'exposures';
const REMEDIATIONS = 'remediations';
const OPEN = 'open';
const DISPOSED = 'disposed';
const CONCLUDED = 'concluded';

const REASON_DISPOSITIONS = [
    {
        value: "acceptable_risk",
        caption: "Acceptable Risk"
    },
    {
        value: "false_positive",
        caption: "False Positive"
    },
    {
        value: "compensating_control",
        caption: "Compensating Control"
    }
];

export { EXPOSURES, REMEDIATIONS, OPEN, DISPOSED, CONCLUDED, REASON_DISPOSITIONS };
