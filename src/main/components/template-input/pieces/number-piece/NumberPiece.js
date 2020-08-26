import './NumberPiece.less';
import React from 'react';

export default class NumberPiece extends React.Component {
    constructor(props) {
        super(props);

        const {defaultValue, max} = this.props;
        const [digits, value] = NumberPiece.normalizeDigitsAndValue(defaultValue, max);

        this.state = {
            digits,
            value,
            focused: false,
            autoChangeFocusAllowed: getIsAutoChangeFocusAllowed(digits),
            shouldReplaceIfAddDigit: false,

            // when typing, value can be invalid temporarily,
            // typing is char by char, if validate immediately, users cannot type what they want
            // do not validate until blurring happened completely
            isTemp: false,
            lastValidDigitsAndValueBeforeBlur: null
        };

        this.pushChange();

        /**
         * @type {HTMLInputElement}
         */
        this.input = null;

    }

    componentDidMount() {
        this.initInputStyle();
    }

    componentDidUpdate() {
        if (!this.state.isTemp) {
            this.ensureValueIsValid();
        }
    }

    /**
     *
     * when received new props
     * some rules might be changed
     * @return {boolean}
     */
    ensureValueIsValid = () => {
        const {digits, value, focused, lastValidDigitsAndValueBeforeBlur} = this.state;

        const [validDigits, validValue] =
            (!focused && lastValidDigitsAndValueBeforeBlur !== null)
                ? this.getValidDigitsAndValue(...lastValidDigitsAndValueBeforeBlur)
                : this.getValidDigitsAndValue(digits, value);

        if (value === validValue) {
            return true;
        }

        this.updateDigitsAndValue(validDigits, validValue);
        return false;
    };

    /**
     * First time render, this.input === null
     * After mount, this.input !== null,
     * we need to init input style
     */
    initInputStyle = () => {
        const style = this.getInputStyle(this.getDisplayedValue());

        for (let attr in style) {
            if (style.hasOwnProperty(attr)) {
                this.input.style[attr] = style[attr];
            }
        }
    };

    static getDerivedStateFromProps(props, state) {
        const {value, max} = props;

        const isValueChanged = value !== undefined && value !== state.value && !state.isTemp;

        if (!isValueChanged) {
            return null;
        }

        const digitsAndValue = NumberPiece.normalizeDigitsAndValue(value, max);

        state.digits = digitsAndValue[0];
        state.value = digitsAndValue[1];
        state.lastValidDigitsAndValueBeforeBlur = null;

        return state;
    }

    static normalizeDigitsAndValue = (value, max) => {
        const digits = numberToDigits(value, max);
        return [digits, digitsToNumber(digits)];
    };

    getValidDigitsAndValue = (digits, value) => {
        const {min, max} = this.props;

        if (value === null) {
            return [digits, value];
        }

        if (Number(value) < min) {
            digits = numberToDigits(min, max);
            return [digits, min];
        }

        if (Number(value) > max) {
            digits = numberToDigits(max, max);
            return [digits, max];
        }

        return [digits, value];
    };

    pushChange = (fulfilled) => {
        const {onChange} = this.props;
        const {value} = this.state;

        if (value === null) {
            onChange(null, fulfilled);
            return;
        }

        onChange(Number(value), fulfilled);
    };

    setTempDigitsAndValue = (digits, value) => {
        this.setState({digits, value, isTemp: true}, () => {
            const fulfilled = digits.every(digit => digit !== null);
            this.pushChange(fulfilled);
        });
        this.allowAutoChangeFocusIfOk(digits);
    };

    updateDigitsAndValue = (digits, value) => {
        this.setState({digits, value}, () => this.pushChange(true));
        this.allowAutoChangeFocusIfOk(digits);
    };

    allowAutoChangeFocusIfOk = (digits) => {
        if (getIsAutoChangeFocusAllowed(digits)) {
            this.setState({autoChangeFocusAllowed: true});
        }
    };

    autoChangeFocusIfSuitable = () => {
        if (!this.state.autoChangeFocusAllowed) {
            return;
        }

        if (this.state.digits.every(digit => digit !== null)) {
            this.setState({
                autoChangeFocusAllowed: false
            });

            this.props.autoChangeFocus();
        }
    };

    updateSyncedDigitsAndValue = (digits, value, validate) => {
        if (!validate) {
            this.setTempDigitsAndValue(digits, value);
            return;
        }

        this.updateDigitsAndValue(
            ...this.getValidDigitsAndValue(digits, value)
        );
    };

    syncDigitsToValue = (digits) => {
        const {max} = this.props;

        let number = digitsToNumber(digits);
        let _digits = numberToDigits(number, max);
        number = digitsToNumber(_digits);

        this.updateSyncedDigitsAndValue(
            _digits,
            number,
            false
        );
    };

    syncValueToDigits = (value) => {
        const {max} = this.props;
        const digits = numberToDigits(value, max);
        const number = digitsToNumber(digits);
        this.updateSyncedDigitsAndValue(
            digits,
            number,
            true
        );
    };

    addDigit = (digit) => {
        const {digits} = this.state;

        this.syncDigitsToValue(digits.concat(digit));
    };

    setDigit = (digit) => {
        this.setState({
            autoChangeFocusAllowed: getIsAutoChangeFocusAllowed([])
        });

        this.syncDigitsToValue([digit]);
    };

    popDigit = () => {
        const {digits} = this.state;

        if (digits.length === 0 || digits.every(d => d === '0')) {
            this.syncValueToDigits(null);
            return;
        }

        const _digits = [].concat(digits);
        _digits.pop();
        this.syncDigitsToValue(_digits);
    };

    increaseValue = () => {
        const {min, max, increasingDefaultNumber} = this.props;
        const {value} = this.state;

        if (Number(value) === max) {
            return;
        }

        if (Number(value) > max) {
            this.syncValueToDigits(max);
        }

        if (value === null) {
            this.setState({autoChangeFocusAllowed: false});
            this.syncValueToDigits(increasingDefaultNumber !== undefined ? increasingDefaultNumber : min);
            return;
        }

        this.syncValueToDigits(Number(value) + 1);
    };

    decreaseValue = () => {
        const {min, max, decreasingDefaultNumber} = this.props;
        const {value} = this.state;

        if (Number(value) === min) {
            return;
        }

        if (Number(value) < min) {
            this.syncValueToDigits(min);
        }

        if (value === null) {
            this.setState({autoChangeFocusAllowed: false});
            this.syncValueToDigits(decreasingDefaultNumber !== undefined ? decreasingDefaultNumber : max);
            return;
        }

        if (value > 0) {
            this.syncValueToDigits(Number(value) - 1);
        }
    };

    onKeyDown = ev => {
        if (!isNaN(ev.key)) {
            ev.preventDefault();

            if (this.state.shouldReplaceIfAddDigit) {
                this.setState({
                    shouldReplaceIfAddDigit: false
                });

                this.setDigit(ev.key);
                return;
            }

            this.addDigit(ev.key);
            return;
        }

        if (ev.key === 'Delete' || ev.key === 'Backspace') {
            ev.preventDefault();

            if (this.state.digits.every(d => d === null)) {
                if (ev.key === 'Delete') {
                    this.props.onForward();
                    return;
                }

                this.props.onBackward();
                return;
            }

            if (this.state.shouldReplaceIfAddDigit) {
                this.setState({
                    shouldReplaceIfAddDigit: false
                });
            }

            this.popDigit();

            return;
        }

        if (ev.key === 'ArrowUp') {
            ev.preventDefault();
            this.increaseValue();
            return;
        }

        if (ev.key === 'ArrowDown') {
            ev.preventDefault();
            this.decreaseValue();
            return;
        }

        if (ev.key === 'ArrowLeft') {
            ev.preventDefault();
            this.props.onBackward();
            return;
        }

        if (ev.key === 'ArrowRight') {
            ev.preventDefault();
            this.props.onForward();
            return;
        }

        this.props.onUnhandledKeyDown(ev.key);
    };

    onKeyUp = ev => {
        ev.preventDefault();

        this.autoChangeFocusIfSuitable();

        this.props.onUnhandledKeyUp(ev.key);
    };

    onPaste = ev => {
        ev.preventDefault();

    };

    onChange = ev => {
        ev.preventDefault();

    };

    onInput = ev => {
        ev.preventDefault();

    };

    onFocus = ev => {
        const {onFocus} = this.props;
        const {digits} = this.state;

        this.setState(
            {
                focused: true,
                shouldReplaceIfAddDigit: true,
                autoChangeFocusAllowed: getIsAutoChangeFocusAllowed(digits)
            },
            () => onFocus(ev)
        );
    };

    onBlur = ev => {
        const {onBlur} = this.props;
        const {digits, value} = this.state;

        this.setState(
            {focused: false},
            () => {
                onBlur(ev);

                this.setState(
                    {isTemp: false},
                    () => {
                        const [validDigits, validValue] = this.getValidDigitsAndValue(digits, value);

                        this.updateDigitsAndValue(validDigits, validValue);

                        this.setState({
                            lastValidDigitsAndValueBeforeBlur: [validDigits, validValue]
                        });
                    }
                );
            }
        );
    };

    getDisplayedValue = () => {
        const {emptyDigit} = this.props;
        const {digits} = this.state;

        if (digits.every(digit => digit === null)) {
            return digits.map(() => emptyDigit).join('');
        }

        return digits.map(digit => digit === null ? '0' : digit).join('');
    };

    getInputStyle = (displayedValue) => {
        const padX = 1;
        const padY = 3;
        return {
            boxSizing: 'content-box',
            padding: `${padY}px ${padX}px`,
            textAlign: 'center',
            minWidth: measureTextWidth(displayedValue, this.input || document.body) + 2 * padX + 'px'
        };
    };

    render() {
        const {disabled} = this.props;
        const {focused} = this.state;
        const displayedValue = this.getDisplayedValue();
        const inputStyle = this.getInputStyle(displayedValue);

        return <div className={'number-piece' + (focused ? ' focused' : '')}>
            <input
                type="text"
                ref={el => {
                    this.input = el;
                    this.props.onInputRef(el);
                }}
                onKeyDown={this.onKeyDown}
                onKeyUp={this.onKeyUp}
                onPaste={this.onPaste}
                onChange={this.onChange}
                onInput={this.onInput}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                value={displayedValue}
                style={inputStyle}
                disabled={disabled}
                spellCheck={false}
            />
        </div>;
    }
}


NumberPiece.defaultProps = {
    defaultValue: null,
    value: undefined,
    min: 0,
    max: 99,
    emptyDigit: '-',
    increasingDefaultNumber: undefined,
    decreasingDefaultNumber: undefined,
    disabled: false,
    onInputRef: (el) => {},
    onChange: (value, fulfilled) => console.log('(TemplateInput/NumberPiece) onChange is omitted', value, fulfilled),
    onBackward: () => {},
    onForward: () => {},
    onFocus: () => {},
    onBlur: () => {},
    onUnhandledKeyDown: (key) => {},
    onUnhandledKeyUp: (key) => {},
    autoChangeFocus: () => {},
};

/**
 *
 * @param digits
 * @return {string|null}
 */
function digitsToNumber(digits) {
    const valuableDigits = digits.filter(digit => digit !== null);

    if (valuableDigits.length === 0) {
        return null;
    }

    return valuableDigits.join('');
}


/**
 *
 * @param number
 * @param max
 * @return {(string|null)[]}
 */
function numberToDigits(number, max) {
    const numOfDigits = String(max).length;

    if (number === null || number < 0) {
        const digits = [];

        for (let i = 0; i < numOfDigits; i++) {
            digits.push(null);
        }

        return digits;
    }

    const digits = String(number).split('');

    if (digits.length > 0) {
        while (Number(digits.join('')) > max) {
            digits.shift();
        }
    }

    if (Number(digits.join('')) * 10 > max) {
        while (digits.length < numOfDigits) {
            digits.unshift('0');
        }
    } else {
        while (digits.length < numOfDigits) {
            digits.unshift(null);
        }
    }

    return digits;
}

function getIsAutoChangeFocusAllowed(digits) {
    return digits.every(digit => digit === null);
}


/** @type {CanvasRenderingContext2D} */
const context2d = document.createElement('canvas').getContext('2d');

function measureTextWidth(text, el) {
    context2d.font = window.getComputedStyle(el).font;
    return context2d.measureText(text).width;
}
