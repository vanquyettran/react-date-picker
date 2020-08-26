function getLocalItem(key, defVal) {
    var cacheDataString = localStorage.getItem(key);
    if (cacheDataString) {
        return JSON.parse(cacheDataString);
    }
    return defVal;
}

function setLocalItem(key, value) {
    var cacheDataString = JSON.stringify(value);
    localStorage.setItem(key, cacheDataString);
}

export {
    setLocalItem,
    getLocalItem
}

export default {
    setItem: setLocalItem,
    getItem: getLocalItem
}
