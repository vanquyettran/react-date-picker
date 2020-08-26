
function jsonCopy(json_var) {
    return JSON.parse(JSON.stringify(json_var))
}

function jsonCompare(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function flattenObject(nestedObject) {
    let result = {};

    for (let key1 in nestedObject) {
        if (!nestedObject.hasOwnProperty(key1) || 'object' !== typeof nestedObject[key1]) {
            continue;
        }

        for (let key2 in nestedObject[key1]) {
            if (!nestedObject[key1].hasOwnProperty(key2)) {
                continue;
            }

            if (nestedObject[key1][key2] !== null && 'object' === typeof nestedObject[key1][key2]) {
                for (let key3 in nestedObject[key1][key2]) {
                    if (nestedObject[key1][key2].hasOwnProperty(key3)) {
                        const flatKey = key1 + '.' + key2 + '.' + key3;
                        result[flatKey] = nestedObject[key1][key2][key3];
                    }
                }
            } else {
                const flatKey = key1 + '.' + key2;
                result[flatKey] = nestedObject[key1][key2];
            }
        }
    }

    return result;
}

export {
    jsonCopy,
    jsonCompare,
    flattenObject
}
