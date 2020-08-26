import moment from "moment/moment";
import {DISPLAYED_DATE_FORMAT, STANDARD_DATE_FORMAT} from "../../view-constants/date-time/formats";

function stringToDate(dateTimestamp) {
    if (dateTimestamp === null) {
        return [null, null, null];
    }

    const date = new Date(dateTimestamp);
    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    ];
}

function dateToString([y, m, d]) {
    if (dateIsNull([y, m, d])) {
        return null;
    }

    return moment([y, m - 1, d]).format(STANDARD_DATE_FORMAT);
}

function dateToDisplayedString([y, m, d]) {
    if (dateIsNull([y, m, d])) {
        return null;
    }

    return moment([y, m - 1, d]).format(DISPLAYED_DATE_FORMAT);
}

function datesAreEqual([y1, m1, d1], [y2, m2, d2]) {
    return y1 === y2 && m1 === m2 && d1 === d2;
}

function dateIsNull([y, m, d]) {
    return y === null || m === null || d === null;
}

function compareDates([y1, m1, d1], [y2, m2, d2]) {
    const date1Null = dateIsNull([y1, m1, d1]);
    const date2Null = dateIsNull([y2, m2, y2]);

    if (date1Null || date2Null) {
        throw new Error('Dates to compare must be not null');
    }

    if (y1 === y2) {
        if (m1 === m2) {
            if (d1 === d2) {
                return 0;
            }

            if (d1 > d2) {
                return 1;
            }

            return -1;
        }

        if (m1 > m2) {
            return 1;
        }

        return -1;
    }

    if (y1 > y2) {
        return 1;
    }

    return -1;
}

function countDaysOfDateRange([[y1, m1, d1], [y2, m2, d2]]) {
    return moment([y2, m2 - 1, d2]).diff(moment([y1, m1 - 1, d1]), 'day') + 1;
}

function getToday() {
    const now = new Date();
    return [now.getFullYear(), now.getMonth() + 1, now.getDate()];
}

function getCurrentYear() {
    return new Date().getFullYear();
}

function getCurrentMonthOfYear() {
    return new Date().getMonth() + 1;
}

function getCurrentDayOfMonth() {
    return new Date().getDate();
}

export {
    stringToDate,
    dateToString,
    dateToDisplayedString,
    dateIsNull,
    datesAreEqual,
    compareDates,
    countDaysOfDateRange,
    getToday,
    getCurrentYear,
    getCurrentMonthOfYear,
    getCurrentDayOfMonth
}
