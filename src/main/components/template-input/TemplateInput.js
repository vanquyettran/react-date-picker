import './TemplateInput.less';
import React from 'react';
import NumberPiece from './pieces/number-piece/NumberPiece';
import SelectablePiece from './pieces/selectable-piece/SelectablePiece';
import {jsonCompare, jsonCopy} from "../../utils/json";

const PIECE_NUMBER = 'number';
const PIECE_SELECTABLE = 'selectable';

export default class TemplateInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            values: props.defaultValues !== null ? props.defaultValues : {},
            focusedPieceKey: null,
            forcedFocusedPieceKey: null
        };
    }

    static getDerivedStateFromProps(props, state) {
        const isUpdateNeeded = props.values !== undefined && !jsonCompare(props.values, state.values);

        if (isUpdateNeeded) {
            state.values = props.values;

            return state;
        }

        return null;
    }

    updateValue = (key, value, fulfilled) => {
        const {onChange} = this.props;
        const {values} = this.state;

        values[key] = value;

        this.setState(
            {values},
            fulfilled ? () => onChange(values) : undefined
        );
    };

    updateFocusedPiece = (key, callback) => {
        this.setState({focusedPieceKey: key}, callback);
    };

    focusPiece = (key) => {
        this.setState({forcedFocusedPieceKey: key});
    };

    autoChangeFocus = (key) => {
        const {template} = this.props;

        let before = null;
        let after = null;

        let afterStarted = false;

        for (let i = 0; i < template.length; i++) {
            const pieceCnf = template[i];

            if (pieceCnf.key === key) {
                afterStarted = true;
                continue;
            }

            if (this.getIsAlienPiece(pieceCnf)) {
                continue;
            }

            if (afterStarted) {
                after = pieceCnf.key;
                break;
            }

            if (before === null) {
                before = pieceCnf.key;
            }
        }

        if (after !== null) {
            this.focusPiece(after);
            return;
        }

        if (before !== null) {
            this.focusPiece(before);
        }
    };

    focusNextPiece = (key) => {
        const sibling = this.getSiblingPiece(key, true);

        if (sibling) {
            this.focusPiece(sibling.key);

            return true;
        }

        return false;
    };

    focusPrevPiece = (key) => {
        const sibling = this.getSiblingPiece(key, false);

        if (sibling) {
            this.focusPiece(sibling.key);

            return true;
        }

        return false;
    };

    focusFirstPiece = () => {
        const {template} = this.props;

        for (let i = 0; i < template.length; i++) {
            const pieceCnf = template[i];

            if (!this.getIsAlienPiece(pieceCnf)) {
                this.focusPiece(pieceCnf.key);

                return;
            }
        }
    };

    focusLastPiece = () => {
        const {template} = this.props;

        for (let i = template.length - 1; i >= 0; i--) {
            const pieceCnf = template[i];

            if (!this.getIsAlienPiece(pieceCnf)) {
                this.focusPiece(pieceCnf.key);

                return;
            }
        }
    };

    getSiblingPiece = (key, isForward) => {
        const {template} = this.props;

        const arrayOfPieceCnf = [].concat(template);

        if (!isForward) {
            arrayOfPieceCnf.reverse();
        }

        let reached = false;

        return arrayOfPieceCnf.find(pieceCnf => {
            if (this.getIsAlienPiece(pieceCnf)) {
                return false;
            }

            if (key === null) {
                return pieceCnf;
            }

            if (key === pieceCnf.key) {
                reached = true;
                return false;
            }

            return reached;
        });
    };

    getIsAlienPiece = (pieceCnf) => {
        if ('string' === typeof pieceCnf) {
            return true;
        }

        if (React.isValidElement(pieceCnf)) {
            return true;
        }

        return false;
    };

    getAlienPiece = (pieceCnf) => {
        return pieceCnf;
    };

    getNumberPiece = (pieceCnf, disabled) => {
        const {defaultValues, onUnhandledKeyDown, onUnhandledKeyUp} = this.props;
        const {values, forcedFocusedPieceKey} = this.state;

        const propValue = this.props.values !== undefined ? this.props.values[pieceCnf.key] : undefined;
        const defaultValue = defaultValues !== null ? defaultValues[pieceCnf.key] : null;
        const min = 'number' === typeof pieceCnf.min ? pieceCnf.min : pieceCnf.min(values);
        const max = 'number' === typeof pieceCnf.max ? pieceCnf.max : pieceCnf.max(values);

        const onInputRef = el => {
            if (el && forcedFocusedPieceKey === pieceCnf.key) {
                el.focus();
                this.focusPiece(null);
            }
        };

        const onBlur = ev => {

            // add to callback queue
            // to wait for next focus happens immediately on other pieces of this input instance
            // if true, just ignore
            // if no focus happened, set focused key null, and fire onBlurAll
            setTimeout(() => {
                if (this.state.focusedPieceKey !== pieceCnf.key) {
                    return;
                }
                this.updateFocusedPiece(null);
                this.props.onBlurAll();
            }, 0);
        };

        const onFocus = ev => {
            this.updateFocusedPiece(pieceCnf.key, () => {
                this.props.onFocus(pieceCnf.key);
            });
        };

        return <NumberPiece
            value={propValue}
            defaultValue={defaultValue}
            emptyDigit={pieceCnf.emptyDigit}
            min={min}
            max={max}
            increasingDefaultNumber={pieceCnf.increasingDefaultNumber}
            decreasingDefaultNumber={pieceCnf.decreasingDefaultNumber}
            disabled={disabled}
            onInputRef={onInputRef}
            onChange={(value, fulfilled) => this.updateValue(pieceCnf.key, value, fulfilled)}
            onBackward={() => this.focusPrevPiece(pieceCnf.key) || this.focusLastPiece()}
            onForward={() => this.focusNextPiece(pieceCnf.key) || this.focusFirstPiece()}
            onBlur={onBlur}
            onFocus={onFocus}
            onUnhandledKeyDown={onUnhandledKeyDown}
            onUnhandledKeyUp={onUnhandledKeyUp}
            autoChangeFocus={() => this.autoChangeFocus(pieceCnf.key)}
        />;
    };

    getSelectablePiece = (pieceCnf, disabled) => {
        /**
         * Not implemented yet
         */
        return <SelectablePiece/>;
    };

    getPiece = (pieceCnf, disabled) => {
        if (this.getIsAlienPiece(pieceCnf)) {
            return this.getAlienPiece(pieceCnf);
        }

        if (pieceCnf.type === PIECE_NUMBER) {
            return this.getNumberPiece(pieceCnf, disabled);
        }

        if (pieceCnf.type === PIECE_SELECTABLE) {
            return this.getSelectablePiece(pieceCnf, disabled);
        }
    };

    onClick = (ev) => {
        const {focusedPieceKey} = this.state;
        if (focusedPieceKey === null) {
            const piece = this.getSiblingPiece(null, true);
            this.focusPiece(piece.key);
        }
    };

    render() {
        const {template, disabled} = this.props;

        return <div
            className="template-input"
            onClick={(ev) => this.onClick(ev)}
        >
            <ul>
                {
                    template.map(
                        (pieceCnf, index) =>
                            <li key={pieceCnf.key || index}>
                                {this.getPiece(pieceCnf, disabled)}
                            </li>
                    )
                }
            </ul>
        </div>
    }
}

TemplateInput.defaultProps = {
    defaultValues: null,
    values: undefined,
    template: [],
    onChange: (values) => console.log('(TemplateInput) onChange is omitted', values),
    onFocus: (key) => {},
    onBlurAll: () => {},
    onUnhandledKeyDown: (key) => {},
    onUnhandledKeyUp: (key) => {},
};

export {
    PIECE_NUMBER,
    PIECE_SELECTABLE
}
