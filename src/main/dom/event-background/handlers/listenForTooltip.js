import Tooltips from "../../../components/tooltips/Tooltips";



// UTILS

function getTooltipContent(opener) {
    return opener.getAttribute('aria-label');
}

function isCanHold(opener) {
    const ariaControls = opener.getAttribute('aria-controls');
    if (ariaControls) {
        return ariaControls.split(' ').includes('click-to-hold-tooltip');
    }

    return false;
}

/**
 *
 * @param {HTMLElement|Node} el
 * @param {number?} triedCount
 * @return {*}
 */
function findOpener(el, triedCount = 0) {
    if (!(el instanceof HTMLElement)) {
        return null;
    }

    if (getTooltipContent(el)) {
        return el;
    }

    if (triedCount < 3) {
        return findOpener(el.parentNode, triedCount + 1);
    }

    return null;
}




// MAIN

let activeOpener = null;
let holdingOpener = null;

function onMouseMove(ev) {
    const opener = findOpener(ev.target);

    if (opener !== null && opener === activeOpener) {
        return;
    }

    if (opener !== null && opener === holdingOpener) {
        return;
    }

    if (activeOpener !== null) {
        deactivate();
    }

    if (opener === null) {
        return;
    }

    activate(opener);
}

function activate(opener) {
    activeOpener = opener;

    Tooltips.add(getTooltipContent(opener), opener, {
        appearance: 'soft',
        noCloseButton: true,
        noPointer: true,
        delayedBeforeAppend: true,
    });

    if (isCanHold(opener)) {
        listenForHold(opener);
    }
}

function deactivate() {
    Tooltips.remove(activeOpener);

    activeOpener = null;
}

function hold(opener) {
    holdingOpener = opener;

    Tooltips.add(getTooltipContent(opener), opener, {appearance: 'hard'}, (opener) => {
        if (opener === holdingOpener) {
            holdingOpener = null;
        }
    });
}

function listenForHold(opener) {
    opener.addEventListener('click', ev => {
        ev.stopPropagation();

        deactivate();

        hold(opener);
    });
}



// EXPORT

export default function () {
    document.addEventListener('mousemove', onMouseMove, {capture: true, passive: true});
}
