import {getLastDayOfMonth} from "../../utils/date-time";
import {PIECE_NUMBER} from "../template-input/TemplateInput";
import {getCurrentDayOfMonth, getCurrentYear, getCurrentMonthOfYear} from "../../utils/date-ymd";

export default [
    {
        key: 'date',
        type: PIECE_NUMBER,
        min: 1,
        max: ({year, month}) => getLastDayOfMonth([year, month]),
        increasingDefaultNumber: getCurrentDayOfMonth(),
        decreasingDefaultNumber: getCurrentDayOfMonth(),
        emptyDigit: 'd',
    },
    '/',
    {
        key: 'month',
        type: PIECE_NUMBER,
        min: 1,
        max: 12,
        increasingDefaultNumber: getCurrentMonthOfYear(),
        decreasingDefaultNumber: getCurrentMonthOfYear(),
        emptyDigit: 'm',
    },
    '/',
    {
        key: 'year',
        type: PIECE_NUMBER,
        min: 1,
        max: 9999,
        increasingDefaultNumber: getCurrentYear(),
        decreasingDefaultNumber: getCurrentYear(),
        emptyDigit: 'y',
    },
];
