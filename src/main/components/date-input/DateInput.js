import './DateInput.less';
import React from 'react';
import DatePicker from '../date-picker/DatePicker';
import TemplateInput from '../template-input/TemplateInput';
import Dropdown from '../dropdown/Dropdown';
import Icon from "../icon/Icon";
import {MAX_YEAR, MIN_YEAR} from "../../view-constants/date-time/limitations";
import {translate} from "../../i18n";
import {datesAreEqual, dateIsNull} from "../../utils/date-ymd/index";
import dateTemplate from "./dateTemplate";

export default class DateInput extends React.Component {
    constructor(props) {
        super(props);

        const [year, month, date] = this.props.defaultValue;

        this.state = {
            year,
            month,
            date,
            fallbackValue: this.getIsNotPartialNull(year, month, date) ? [year, month, date] : [null, null, null],
            syncFrom: null,
            pickerShown: false
        };

        /**
         *
         * @type {HTMLDivElement}
         */
        this.el = null;
    }

    static getDerivedStateFromProps(props, state) {
        if (props.value === undefined) {
            return null;
        }

        if (state.year === props.value[0] &&
            state.month === props.value[1] &&
            state.date === props.value[2]
        ) {
            return null;
        }

        state.year = props.value[0];
        state.month = props.value[1];
        state.date = props.value[2];

        return state;
    }

    pushChange = () => {
        const {fallbackValue} = this.state;
        this.props.onChange(fallbackValue);
    };

    sync = (year, month, date, syncFrom) => {

        // check if partial null
        if (!this.getIsNotPartialNull(year, month, date)) {
            this.setState(
                {
                    year,
                    month,
                    date,
                    syncFrom
                },
                () => this.setState(
                    {syncFrom: null}
                )
            );

            return;
        }

        // if not partial null

        // if all year, month, date are null or Date is valid
        // save as fallback value
        if (year === null || this.checkDateError([year, month, date]) === null) {
            this.setState({
                fallbackValue: [year, month, date]
            });
        }

        this.setState(
            {year, month, date, syncFrom},
            () => this.setState(
                {syncFrom: null},
                () => this.pushChange()
            )
        );
    };

    syncNeeded = (name) => {
        const {syncFrom} = this.state;
        return syncFrom !== null && syncFrom !== name;
    };

    showPicker = () => {
        if (this.state.pickerShown) {
            return;
        }

        this.setState({pickerShown: true});
    };

    hidePicker = () => {
        if (!this.state.pickerShown) {
            return;
        }

        this.setState({pickerShown: false});
    };

    clear = () => {
        this.sync(null, null, null, 'clearer');
        this.hidePicker();
    };

    onBlur = () => {
        const {year, month, date, fallbackValue} = this.state;
        if (!this.getIsNotPartialNull(year, month, date) || this.checkDateError([year, month, date]) !== null) {
            this.sync(fallbackValue[0], fallbackValue[1], fallbackValue[2], 'onBlur');
        }
    };

    getIsNotPartialNull = (year, month, date) => {
        return (year !== null && month !== null && date !== null) || (year === null && month === null && date === null);
    };

    checkDateError = (dateYmd, useStrict = false) => {
        const {defaultValue, getDateError, shouldAllowInvalidDefaultValue} = this.props;

        if (dateIsNull(dateYmd)) {
            return null;
        }

        if (!useStrict && shouldAllowInvalidDefaultValue && datesAreEqual(defaultValue, dateYmd)) {
            return null;
        }

        const [year, month, date] = dateYmd;

        if (year < MIN_YEAR) {
            return translate('Only support from ::minYear onwards', {minYear: MIN_YEAR});
        }

        if (year > MAX_YEAR) {
            return translate('Only support from ::maxYear back', {maxYear: MAX_YEAR});
        }

        return getDateError(dateYmd);
    };

    getDateHint = (dateYmd) => {
        const {getDateHint, defaultValue, shouldAllowInvalidDefaultValue} = this.props;

        if (shouldAllowInvalidDefaultValue &&
            !dateIsNull(defaultValue) &&
            datesAreEqual(defaultValue, dateYmd) &&
            this.checkDateError(dateYmd, true) !== null
        ) {
            return translate('Allowed because it has been set up before');
        }

        return getDateHint(dateYmd);
    };

    render() {
        const {disabled, removable} = this.props;
        const {year, month, date, pickerShown} = this.state;

        const isEmpty = year === null && month === null && date === null;

        return <div
            className={
                'date-input'
                + (pickerShown ? ' focused' : '')
                + (isEmpty ? ' is-empty' : '')
                + (disabled ? ' disabled' : '')
            }
            ref={el => this.el = el}
        >
            <TemplateInput
                template={dateTemplate}
                defaultValues={{year, month, date}}
                values={this.syncNeeded('templateInput') ? {year, month, date} : undefined}
                onChange={({year, month, date}) => this.sync(year, month, date, 'templateInput')}
                onFocus={(key) => this.showPicker()}
                onBlurAll={() => this.onBlur()}
                disabled={disabled}
            />
            {
                (isEmpty || disabled || !removable)
                    ?
                    <button
                        type="button"
                        className="calendar-button"
                        onClick={() => disabled || this.showPicker()}
                    >
                        <Icon name="calendar"/>
                    </button>
                    :
                    <button
                        type="button"
                        className="clear-button"
                        onClick={() => this.clear()}
                    >
                        <Icon name="times"/>
                    </button>
            }
            {
                !disabled &&
                pickerShown &&
                <Dropdown
                    name="date-picker"
                    opener={this.el}
                    close={this.hidePicker}
                >
                    <DatePicker
                        defaultDate={[year, month, date]}
                        date={this.syncNeeded('picker') ? [year, month, date] : undefined}
                        onChange={([year, month, date]) => {
                            this.sync(year, month, date, 'picker');
                            this.hidePicker();
                        }}
                        getDateError={this.checkDateError}
                        getDateHint={this.getDateHint}
                    />
                </Dropdown>
            }
        </div>;
    }
}

DateInput.defaultProps = {
    defaultValue: [null, null, null],
    value: undefined,
    shouldAllowInvalidDefaultValue: false,
    getDateError: ([year, month, date]) => null,
    onChange: ([year, month, date]) => console.log('(DateInput) onChange is omitted', [year, month, date])
};
