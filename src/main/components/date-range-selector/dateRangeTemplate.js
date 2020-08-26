import {PIECE_NUMBER} from "../template-input/TemplateInput";
import {getLastDayOfMonth} from "../../utils/date-time";
import React from 'react';
import {getCurrentDayOfMonth, getCurrentMonthOfYear, getCurrentYear} from "../../utils/date-ymd";

export default [
    {
        key: 'date1',
        type: PIECE_NUMBER,
        min: 1,
        max: ({year1, month1}) => getLastDayOfMonth([year1, month1]),
        increasingDefaultNumber: getCurrentDayOfMonth(),
        decreasingDefaultNumber: getCurrentDayOfMonth(),
        emptyDigit: 'd'
    },
    '/',
    {
        key: 'month1',
        type: PIECE_NUMBER,
        min: 1,
        max: 12,
        increasingDefaultNumber: getCurrentMonthOfYear(),
        decreasingDefaultNumber: getCurrentMonthOfYear(),
        emptyDigit: 'm'
    },
    '/',
    {
        key: 'year1',
        type: PIECE_NUMBER,
        min: 1,
        max: 9999,
        increasingDefaultNumber: getCurrentYear(),
        decreasingDefaultNumber: getCurrentYear(),
        emptyDigit: 'y'
    },
    <span>&nbsp;-&nbsp;</span>,
    {
        key: 'date2',
        type: PIECE_NUMBER,
        min: 1,
        max: ({year2, month2}) => getLastDayOfMonth([year2, month2]),
        increasingDefaultNumber: getCurrentDayOfMonth(),
        decreasingDefaultNumber: getCurrentDayOfMonth(),
        emptyDigit: 'd'
    },
    '/',
    {
        key: 'month2',
        type: PIECE_NUMBER,
        min: 1,
        max: 12,
        increasingDefaultNumber: getCurrentMonthOfYear(),
        decreasingDefaultNumber: getCurrentMonthOfYear(),
        emptyDigit: 'm'
    },
    '/',
    {
        key: 'year2',
        type: PIECE_NUMBER,
        min: 1,
        max: 9999,
        increasingDefaultNumber: getCurrentYear(),
        decreasingDefaultNumber: getCurrentYear(),
        emptyDigit: 'y'
    },
];
