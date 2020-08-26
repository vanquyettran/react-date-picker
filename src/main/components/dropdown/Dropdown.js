import './Dropdown.less';
import React from 'react';
import LayoutPortal from '../../layout/components/layout-portal/LayoutPortal';
import {setClickOutsideToClose, unsetClickOutsideToClose} from "../../dom/event-handlers/click-outside-to-close";
import {getLayoutScrollElement} from "../../dom/element/query";

let autoIncId = 0;

const MIN_CONTENT_MAX_HEIGHT = 50;
const DEFAULT_CONTENT_MAX_HEIGHT = 400;

export default class Dropdown extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contentViewableMaxHeight: DEFAULT_CONTENT_MAX_HEIGHT
        };

        this.id = ++autoIncId;

        /**
         *
         * @type {HTMLDivElement}
         */
        this.dropdown = null;

        /**
         *
         * @type {HTMLDivElement}
         */
        this.pointer = null;

        /**
         *
         * @type {function[]}
         */
        this.eventUnsubscribers = [];
    }

    componentDidMount() {
        this.setClickOutsideEventListener();
        this.setResizeEventListener();
        this.setScrollEventListeners();
        this.refreshDisplay();
    }

    componentWillUnmount() {
        this.unsubscribeAllEvents();
    }

    componentDidUpdate() {
        this.refreshDisplay();
    }

    unsubscribeAllEvents = () => {
        this.eventUnsubscribers.forEach(fn => fn());
    };

    addEventUnsubscriber = (fn) => {
        if (!this.eventUnsubscribers.includes(fn)) {
            this.eventUnsubscribers.push(fn);
        }
    };

    setClickOutsideEventListener = () => {
        setClickOutsideToClose(
            `components.Dropdown.${this.id}`,
            [this.props.opener, this.dropdown, this.pointer].filter(Boolean),
            this.props.close
        );

        this.addEventUnsubscriber(() => {
            unsetClickOutsideToClose(`components.Dropdown.${this.id}`);
        });
    };

    setResizeEventListener = () => {
        window.addEventListener('resize', this.refreshDisplay);

        this.addEventUnsubscriber(() => {
            window.removeEventListener('resize', this.refreshDisplay);
        })
    };

    setScrollEventListeners = () => {
        /**
         * @type {HTMLElement}
         */
        const opener = this.props.opener;

        if (!opener.parentElement) {
            return;
        }

        /**
         *
         * @param {HTMLElement} el
         */
        const check = (el) => {
            const style = window.getComputedStyle(el);

            if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflowX === 'auto' || style.overflowX === 'scroll') {
                el.addEventListener('scroll', this.refreshDisplay);

                this.addEventUnsubscriber(() => {
                    el.removeEventListener('scroll', this.refreshDisplay);
                });
            }
        };

        /**
         *
         * @param {HTMLElement} el
         */
        const backtick = (el) => {
            check(el);

            if (el.parentElement) {
                backtick(el.parentElement);
            }
        };

        backtick(opener.parentElement);
    };

    dispatchOnRefreshDisplay = () => {
        const {onRefreshDisplay} = this.props;

        onRefreshDisplay && onRefreshDisplay();
    };

    refreshDisplay = () => {
        if (this.dropdown === null) {
            return;
        }

        const dr = this.getDropdownValues();
        const op = this.getOpenerValues();
        const fr = this.getFrameValues();
        this.updateDimensions(dr, op, fr);

        requestAnimationFrame(() => {
            if (this.dropdown === null) {
                return;
            }

            const dr = this.getDropdownValues();
            const op = this.getOpenerValues();
            const fr = this.getFrameValues();
            this.updatePosition(dr, op, fr);
            this.dispatchOnRefreshDisplay();
        });

    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    updateDimensions = (dr, op, fr) => {
        this.updateWidth(dr, op, fr);
        this.updateContentViewableMaxHeight(dr, op, fr);
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    updateWidth = (dr, op, fr) => {
        if (!this.props.matchOpenerWidth) {
            return;
        }

        this.setDropdownStyle('width', op.rect.width + 'px');
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    updateContentViewableMaxHeight = (dr, op, fr) => {
        const maxHeightAbove = this.calcMaxHeightAbove(dr, op, fr);
        const maxHeightBelow = this.calcMaxHeightBelow(dr, op, fr);

        const maxHeight = Math.max(maxHeightAbove, maxHeightBelow);

        const contentViewableMaxHeight = Math.min(DEFAULT_CONTENT_MAX_HEIGHT, Math.max(MIN_CONTENT_MAX_HEIGHT,
            maxHeight - (
                parseInt(dr.style.paddingTop) +
                parseInt(dr.style.paddingBottom) +
                parseInt(dr.style.borderTopWidth) +
                parseInt(dr.style.borderBottomWidth)
            ))
        );

        if (contentViewableMaxHeight !== this.state.contentViewableMaxHeight) {
            this.setState({
                contentViewableMaxHeight
            });
        }
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    updatePosition = (dr, op, fr) => {
        this.updatePositionX(dr, op, fr);
        this.updatePositionY(dr, op, fr);
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    updatePositionX = (dr, op, fr) => {
        this.updateDropdownPositionX(dr, op, fr);

        if (this.pointer) {
            this.updatePointerPositionX(dr, op, fr);
        }
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    updateDropdownPositionX = (dr, op, fr) => {
        const {horizontalAlignment} = this.props;

        if (horizontalAlignment === 'right') {
            this.updateDropdownPositionRight(dr, op, fr);
            return;
        }

        this.updateDropdownPositionLeftOrCenter(dr, op, fr);
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    updateDropdownPositionLeftOrCenter = (dr, op, fr) => {
        const minDropdownLeft = fr.rect.left + this.getEdgeMargin();
        const maxDropdownLeft = fr.rect.right - dr.rect.width - this.getEdgeMargin();
        const {horizontalAlignment} = this.props;

        const defaultDropdownLeft = horizontalAlignment === 'center'
            ? op.rect.left + op.rect.width / 2 - dr.rect.width / 2
            : op.rect.left;

        const dropdownLeft = Math.max(minDropdownLeft, Math.min(maxDropdownLeft, defaultDropdownLeft));

        this.setDropdownStyle('left', dropdownLeft + 'px');
        this.setDropdownStyle('right', 'auto');
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    updateDropdownPositionRight = (dr, op, fr) => {
        const minDropdownRight = this.getEdgeMargin();

        const maxDropdownRight = fr.rect.left + dr.rect.width + this.getEdgeMargin();

        const defaultDropdownRight = fr.rect.right - op.rect.right;

        const dropdownRight = Math.max(minDropdownRight, Math.min(maxDropdownRight, defaultDropdownRight));

        this.setDropdownStyle('right', dropdownRight + 'px');
        this.setDropdownStyle('left', 'auto');
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    updatePointerPositionX = (dr, op, fr) => {
        const pointerLeft = this.calcPointerLeft(dr, op, fr);

        if (pointerLeft < this.getEdgeMargin() || pointerLeft > fr.rect.right - this.getPointerWidth() - this.getEdgeMargin()) {
            this.setPointerStyle('display', 'none');
        } else {
            this.setPointerStyle('display', 'block');
            this.setPointerStyle('left', pointerLeft + 'px');
        }
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    calcPointerLeft = (dr, op, fr) => {
        const {horizontalAlignment} = this.props;

        switch (horizontalAlignment) {
            case 'center':
                return op.rect.left + op.rect.width / 2 - this.getPointerWidth() / 2;
            case 'right':
                return op.rect.right - this.getPointerWidth();
            case 'left':
            default:
                return op.rect.left;
        }
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    updatePositionY = (dr, op, fr) => {

        if (this.shouldDropBelow(dr, op, fr)) {
            this.setDropdownBelow(dr, op, fr);

            if (this.pointer) {
                this.setPointerBelow(dr, op, fr);
            }

            return;
        }

        this.setDropdownAbove(dr, op, fr);

        if (this.pointer) {
            this.setPointerAbove(dr, op, fr);
        }
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    setPointerBelow = (dr, op, fr) => {
        this.setPointerStyle('top', (op.rect.bottom + this.getDropMargin() - this.getPointerHeight() / 2) + 'px');
        this.pointer.setAttribute('data-direction', 'up');
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    setPointerAbove = (dr, op, fr) => {
        this.setPointerStyle('top', (op.rect.top - this.getDropMargin() - this.getPointerHeight() / 2) + 'px');
        this.pointer.setAttribute('data-direction', 'down');
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    setDropdownBelow = (dr, op, fr) => {
        const dropMargin = this.getDropMargin();
        this.setDropdownStyle('top', (op.rect.bottom + dropMargin) + 'px');
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    setDropdownAbove = (dr, op, fr) => {
        const dropMargin = this.getDropMargin();
        this.setDropdownStyle('top', (op.rect.top - dr.rect.height - dropMargin) + 'px');
    };

    shouldDropBelow = (dr, op, fr) => {
        const freeSpaceBelow = this.calcFreeSpaceBelow(dr, op, fr);
        const freeSpaceAbove = this.calcFreeSpaceAbove(dr, op, fr);

        const {isDropReversed} = this.props;

        if (isDropReversed) {
            if (freeSpaceAbove >= 0) {
                return false;
            }

            if (freeSpaceBelow >= 0) {
                return true;
            }

            return !(freeSpaceAbove >= freeSpaceBelow);
        }

        if (freeSpaceBelow >= 0) {
            return true;
        }

        if (freeSpaceAbove >= 0) {
            return false;
        }

        return freeSpaceBelow >= freeSpaceAbove;
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    calcMaxHeightAbove = (dr, op, fr) => {
        const dropMargin = this.getDropMargin();
        const edgeMargin = this.getEdgeMargin();

        return op.rect.top - (fr.rect.top + dropMargin + edgeMargin);
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    calcMaxHeightBelow = (dr, op, fr) => {
        const dropMargin = this.getDropMargin();
        const edgeMargin = this.getEdgeMargin();

        return fr.rect.bottom - (op.rect.bottom + dropMargin + edgeMargin);
    };


    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    calcFreeSpaceAbove = (dr, op, fr) => {
        return this.calcMaxHeightAbove(dr, op, fr) - dr.rect.height;
    };

    /**
     *
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} dr
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} op
     * @param {{style: CSSStyleDeclaration, rect: ClientRect}} fr
     */
    calcFreeSpaceBelow = (dr, op, fr) => {
        return this.calcMaxHeightBelow(dr, op, fr) - dr.rect.height;
    };

    getDropMargin = () => {
        if (this.pointer) {
            if (this.props.hasDropMargin) {
                return 11;
            }

            return 6;
        }

        if (this.props.hasDropMargin) {
            return 5;
        }

        return 0;
    };

    getEdgeMargin = () => {
        return 10;
    };

    getBorderWidth = () => {
        return 1;
    };


    getPointerWidth = () => {
        return 10;
    };

    getPointerHeight = () => {
        return 10;
    };

    /**
     *
     * @param {string} name
     * @param {string|number} value
     */
    setDropdownStyle = (name, value) => {
        this.dropdown.style[name] = value;
    };

    /**
     *
     * @param {string} name
     * @param {string|number} value
     */
    setPointerStyle = (name, value) => {
        this.pointer.style[name] = value;
    };

    /**
     *
     * @return {{style: CSSStyleDeclaration, rect: ClientRect}}
     */
    getOpenerValues = () => {
        const {opener} = this.props;
        return {
            style: window.getComputedStyle(opener),
            rect: opener.getBoundingClientRect()
        };
    };

    /**
     *
     * @return {{style: CSSStyleDeclaration, rect: ClientRect}}
     */
    getFrameValues = () => {
        const frame = getLayoutScrollElement();
        return {
            style: window.getComputedStyle(frame),
            rect: frame.getBoundingClientRect(),
        };
    };

    /**
     *
     * @return {{style: CSSStyleDeclaration, rect: ClientRect}}
     */
    getDropdownValues = () => {
        return {
            style: window.getComputedStyle(this.dropdown),
            rect: this.dropdown.getBoundingClientRect(),
        };
    };

    render = () => {
        const {name, children, isPointerEnabled, horizontalAlignment, appearance} = this.props;
        const {contentViewableMaxHeight} = this.state;

        return <LayoutPortal name="dropdown">
            <div
                className={
                    `dropdown-component click-outside-to-close-ignored horizontal-align-${horizontalAlignment} appearance-${appearance}`
                    + (name ? ` ${name}-dropdown` : '')
                }
                ref={el => this.dropdown = el}
                style={{
                    display: 'block',
                    position: 'fixed',
                }}
            >
                <div className="dropdown-inner" style={{display: 'table'}}>
                    <div style={{display: 'table-row'}}>
                        <div style={{display: 'table-cell'}}>
                            {
                                typeof children === 'function'
                                    ? children(contentViewableMaxHeight, this.refreshDisplay)
                                    : children
                            }
                        </div>
                    </div>
                </div>
            </div>
            {
                isPointerEnabled &&
                <div
                    className={
                        `dropdown-pointer click-outside-to-close-ignored horizontal-align-${horizontalAlignment} appearance-${appearance}`
                        + (name ? ` ${name}-dropdown-pointer` : '')
                    }
                    ref={el => this.pointer = el}
                    style={{
                        display: 'block',
                        position: 'fixed',
                        transform: 'rotate(45deg)',
                    }}
                >
                    <div className="dropdown-pointer-inner" style={{
                        width: this.getPointerWidth() + 'px',
                        height: this.getPointerHeight() + 'px',
                    }}/>
                </div>
            }
        </LayoutPortal>;
    };
}


Dropdown.defaultProps = {
    opener: null,
    close: null,
    matchOpenerWidth: false,
    isDropReversed: false,
    isPointerEnabled: false,
    hasDropMargin: true,
    horizontalAlignment: 'left',
    appearance: 'hard',
    onRefreshDisplay: null
};
