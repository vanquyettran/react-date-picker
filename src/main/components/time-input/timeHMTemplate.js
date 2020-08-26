import {PIECE_NUMBER} from "../template-input/TemplateInput";

export default [
    {
        key: 'hours',
        type: PIECE_NUMBER,
        min: 0,
        max: 23,
        emptyDigit: '-'
    },
    ':',
    {
        key: 'minutes',
        type: PIECE_NUMBER,
        min: 0,
        max: 59,
        emptyDigit: '-'
    }
];
