import overwriteCopyEvent from './handlers/overwriteCopyEvent';
import listenForTooltip from './handlers/listenForTooltip';

export default function () {
    overwriteCopyEvent();
    listenForTooltip();
}

