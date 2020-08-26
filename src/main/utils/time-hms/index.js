
function getAbsoluteSeconds([h, m, s], hasSeconds) {
    return h * 60 * 60 + m * 60 + (hasSeconds ? s : 0);
}

function timesAreEqual([h1, m1, s1], [h2, m2, s2], hasSeconds) {
    if (h1 !== h2) {
        return false;
    }
    if (m1 !== m2) {
        return false;
    }
    if (s1 !== s2 && hasSeconds) {
        return false;
    }
    return true;
}

function timeIsNull([h, m, s], hasSeconds) {
    if (h === null) {
        return true;
    }
    if (m === null) {
        return true;
    }
    if (s === null && hasSeconds) {
        return true;
    }
    return false;
}

function timeIsNullTotally([h, m, s], hasSeconds) {
    if (h === null && m === null && (!hasSeconds || s === null)) {
        return true;
    }
    return false;
}

function stringToTime(str) {
    if (str === null) {
        return [null, null, null];
    }

    const arr = str.split(':').map(t => Number(t));
    if (arr.length < 2) {
        arr.push(0);
    }
    if (arr.length < 3) {
        arr.push(0);
    }
    return arr;
}

function timeToString([h, m, s], hasSeconds) {
    if (h === null) {
        return null;
    }
    if (m === null) {
        return null;
    }
    if (s === null && hasSeconds) {
        return null;
    }
    const hh = (h < 10 ? '0' : '') + h;
    const mm = (m < 10 ? '0' : '') + m;
    if (!hasSeconds) {
        return `${hh}:${mm}`;
    }
    const ss = (s < 10 ? '0' : '') + s;
    return `${hh}:${mm}:${ss}`;
}

export {
    getAbsoluteSeconds,
    timesAreEqual,
    timeIsNull,
    timeIsNullTotally,
    stringToTime,
    timeToString
}
