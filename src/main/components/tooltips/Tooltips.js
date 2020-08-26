import React from 'react';
import DOMCustomEvents, {EVENT_LAYOUT_READY} from "../../dom/custom-events/DOMCustomEvents";
import ReactDOM from "react-dom";
import {getLayoutPortalElement} from "../../dom/element/query";
import Tooltip from "./Tooltip";

let instance = null;
let autoIncId = 0;

class Tooltips extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltips: []
        };

        instance = this;
    }

    add = (content, opener, options, onClose) => {
        const {tooltips} = this.state;

        if (tooltips.find(t => opener === t.opener)) {
            return false;
        }

        if (!opener.hasAttribute('data-tooltip-id')) {
            opener.setAttribute('data-tooltip-id', ++autoIncId);
        }

        tooltips.push({content, opener, options, onClose});
        this.forceUpdate();

        return true;
    };

    remove = (opener) => {
        const {tooltips} = this.state;

        let index = tooltips.findIndex(t => opener === t.opener);

        if (index === -1) {
            return false;
        }

        tooltips.splice(index, 1);
        this.forceUpdate();

        return true;
    };

    render() {
        const {tooltips} = this.state;

        if (tooltips.length === 0) {
            return null;
        }

        return <React.Fragment>
            {
                tooltips.map(({content, opener, options = {}, onClose = null}) => {
                    return <Tooltip
                        key={opener.getAttribute('data-tooltip-id')}
                        opener={opener}
                        appearance={options.appearance}
                        noCloseButton={options.noCloseButton}
                        noPointer={options.noPointer}
                        delayedBeforeAppend={options.delayedBeforeAppend}
                        close={() => {
                            this.remove(opener);
                            onClose && onClose(opener);
                        }}
                    >
                        {content}
                    </Tooltip>;
                })
            }
        </React.Fragment>;
    }
}


let initialized = false;

function init() {
    if (initialized) {
        return;
    }

    initialized = true;

    const render = () => {
        ReactDOM.render(<Tooltips/>, document.createElement('div'));
    };

    if (getLayoutPortalElement()) {
        render();
        return;
    }

    DOMCustomEvents.observe(EVENT_LAYOUT_READY, 'scomponents.Tooltips.render', () => render());
}

export default {
    init: init,
    add: (content, opener, options, onClose) => instance.add(content, opener, options, onClose),
    remove: (opener) => instance.remove(opener)
}
