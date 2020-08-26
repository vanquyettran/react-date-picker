function timeToUTC(time) {
    if ('number' !== typeof time) {
        return time;
    }

    const tz = (new Date().getTimezoneOffset());
    return time + tz * 60 * 1000;
}

function timeFromUTC(time) {
    if ('number' !== typeof time) {
        return time;
    }

    const tz = (new Date().getTimezoneOffset());
    return time - tz * 60 * 1000;
}

function getTimezoneStamp() {
    const gmt = -(new Date().getTimezoneOffset());

    let hours = Math.floor(gmt / 60);
    let minutes = gmt - (60 * hours);

    let hh = (hours < 0 ? '' : '+') + hours;
    let mm = (minutes < 10 ? '0' : '') + minutes;

    return `GMT ${hh}:${mm}`;
}

function checkIsLeapYear(year)
{
    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

function getLastDayOfMonth([year, month]) {
    if (year === null && month === null) {
        return 31;
    }

    if (month === 2) {
        if (year === null || checkIsLeapYear(year)) {
            return 29;
        }

        return 28;
    }

    if ([4, 6, 9, 11].includes(month)) {
        return 30;
    }

    return 31;
}

export {
    timeToUTC,
    timeFromUTC,
    getTimezoneStamp,
    checkIsLeapYear,
    getLastDayOfMonth
}
