const clickOutsideToCloseComponents = {};
/**
 *
 * @param id {string}
 * @param ignoredEls {[Node]}
 * @param close {function}
 */
const setClickOutsideToClose = (id, ignoredEls, close) => {
    if ('string' === typeof id
        && ignoredEls.every(el => el instanceof Node)
        && 'function' === typeof close
    ) {
        clickOutsideToCloseComponents[id] = [ignoredEls, close];
    } else {
        console.error('setClickOutsideToClose invalid arguments', id);
    }
};
const unsetClickOutsideToClose = (id) => {
    delete clickOutsideToCloseComponents[id];
};
const handleClickOutsideToClose = (event, ignoredEls, close) => {
    const alwaysIgnoredEls = [].slice.call(document.querySelectorAll('.click-outside-to-close-ignored'));
    if (ignoredEls
        .concat(alwaysIgnoredEls)
        .every(ignoredEl => {
            return ignoredEl !== event.target
                && !ignoredEl.contains(event.target)
                && document.body.contains(event.target)
        })
    ) {
        close();
    }
};
document.addEventListener('mousedown', function (event) {
    for (let id in clickOutsideToCloseComponents) {
        if (clickOutsideToCloseComponents.hasOwnProperty(id)) {
            handleClickOutsideToClose(event, ...clickOutsideToCloseComponents[id]);
        }
    }
});


export {
    setClickOutsideToClose,
    unsetClickOutsideToClose
}
