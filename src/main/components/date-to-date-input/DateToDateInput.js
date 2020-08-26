import './DateToDateInput.less';
import React from 'react';
import {translate} from "../../i18n";
import DateInput from "../date-input/DateInput";
import {
    dateToString,
    dateToDisplayedString,
    dateIsNull,
    datesAreEqual,
    compareDates, getToday
} from "../../utils/date-ymd";

export default class DateToDateInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            startDate: props.defaultValue[0],
            endDate: props.defaultValue[1]
        };
    }

    pushChanges = () => {
        const {onChange} = this.props;
        const {startDate, endDate} = this.state;
        onChange([startDate, endDate]);
    };

    setValues = (values) => {
        this.setState(values, () => this.pushChanges());
    };

    setStartDate = ([year, month, date]) => {
        if (datesAreEqual([year, month, date], this.state.startDate)) {
            return;
        }
        this.setValues({startDate: [year, month, date]});
    };

    setEndDate = ([year, month, date]) => {
        if (datesAreEqual([year, month, date], this.state.endDate)) {
            return;
        }
        this.setValues({endDate: [year, month, date]});
    };

    checkStartDateError = ([startDate, endDate], useStrict = false) => {
        const {defaultValue, getStartDateError, minStartDate, maxStartDate, shouldAllowInvalidDefaultStartDate} = this.props;

        if (dateIsNull(startDate)) {
            return null;
        }

        if (!dateIsNull(endDate) && compareDates(startDate, endDate) > 0) {
            return translate('Start date cannot be greater than end date');
        }

        if (!useStrict && shouldAllowInvalidDefaultStartDate && datesAreEqual(startDate, defaultValue[0])) {
            return null;
        }

        const customError = getStartDateError([startDate, endDate]);
        if (customError !== null) {
            return customError;
        }

        if (minStartDate !== undefined && !dateIsNull(minStartDate) && compareDates(minStartDate, startDate) > 0) {
            if (datesAreEqual(minStartDate, getToday())) {
                return translate('Start date cannot be in the past');
            }

            return translate('Start date cannot be less than ::minDate', {minDate: dateToDisplayedString(minStartDate)});
        }

        if (maxStartDate !== undefined && !dateIsNull(maxStartDate) && compareDates(startDate, maxStartDate) > 0) {
            if (datesAreEqual(maxStartDate, getToday())) {
                return translate('Start date cannot be in the future');
            }

            return translate('Start date cannot be greater than ::maxDate', {maxDate: dateToDisplayedString(maxStartDate)});
        }

        return null;
    };

    checkEndDateError = ([startDate, endDate], useStrict = false) => {
        const {defaultValue, getEndDateError, minEndDate, maxEndDate, shouldAllowInvalidDefaultEndDate} = this.props;

        if (dateIsNull(endDate)) {
            return null;
        }

        if (!dateIsNull(startDate) && compareDates(startDate, endDate) > 0) {
            return translate('End date cannot be less than start date');
        }

        if (!useStrict && shouldAllowInvalidDefaultEndDate && datesAreEqual(endDate, defaultValue[1])) {
            return null;
        }

        const customError = getEndDateError([startDate, endDate]);
        if (customError !== null) {
            return customError;
        }

        if (minEndDate !== undefined && !dateIsNull(minEndDate) && compareDates(minEndDate, endDate) > 0) {
            if (datesAreEqual(minEndDate, getToday())) {
                return translate('End date cannot be in the past');
            }

            return translate('End date cannot be less than ::minDate', {minDate: dateToDisplayedString(minEndDate)});
        }

        if (maxEndDate !== undefined && !dateIsNull(maxEndDate) && compareDates(endDate, maxEndDate) > 0) {
            if (datesAreEqual(maxEndDate, getToday())) {
                return translate('End date cannot be in the future');
            }

            return translate('End date cannot be greater than ::maxDate', {maxDate: dateToDisplayedString(maxEndDate)});
        }

        return null;
    };

    getStartDateHint = (date) => {
        const {defaultValue, shouldAllowInvalidDefaultStartDate} = this.props;
        const {endDate} = this.state;

        if (shouldAllowInvalidDefaultStartDate &&
            !dateIsNull(defaultValue[0]) &&
            datesAreEqual(defaultValue[0], date) &&
            this.checkStartDateError([defaultValue[0], endDate], true) !== null
        ) {
            return translate('Allowed because it has been set up before');
        }

        return null;
    };

    getEndDateHint = (date) => {
        const {defaultValue, shouldAllowInvalidDefaultEndDate} = this.props;
        const {startDate} = this.state;

        if (shouldAllowInvalidDefaultEndDate &&
            !dateIsNull(defaultValue[1]) &&
            datesAreEqual(defaultValue[1], date) &&
            this.checkEndDateError([startDate, defaultValue[1]], true) !== null
        ) {
            return translate('Allowed because it has been set up before');
        }

        return null;
    };


    render() {
        const {disabled, startDateRemovable, endDateRemovable} = this.props;
        const {startDate, endDate} = this.state;

        return <div className="date-to-date-input">
            <DateInput
                defaultValue={startDate}
                onChange={this.setStartDate}
                disabled={disabled}
                getDateError={date => this.checkStartDateError([date, endDate])}
                removable={startDateRemovable}
                getDateHint={this.getStartDateHint}
            />
            <span>{translate('to')}</span>
            <DateInput
                defaultValue={endDate}
                onChange={this.setEndDate}
                disabled={disabled}
                getDateError={date => this.checkEndDateError([startDate, date])}
                removable={endDateRemovable}
                getDateHint={this.getEndDateHint}
            />
        </div>;
    }
}

DateToDateInput.defaultProps = {
    defaultValue: [[null, null, null], [null, null, null]],
    value: undefined,
    disabled: false,
    minEndDate: undefined,
    maxEndDate: undefined,
    minStartDate: undefined,
    maxStartDate: undefined,
    getStartDateError: ([startDate, endDate]) => null,
    getEndDateError: ([startDate, endDate]) => null,
    shouldAllowInvalidDefaultStartDate: false,
    shouldAllowInvalidDefaultEndDate: false,
    startDateRemovable: false,
    endDateRemovable: false,
    onChange: (value) => {}
};
