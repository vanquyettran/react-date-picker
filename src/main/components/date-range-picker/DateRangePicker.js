import './DateRangePicker.less';
import React from 'react';
import DatePicker from "../date-picker/DatePicker";
import {
    stringToDate,
    dateToString,
    dateIsNull,
    datesAreEqual,
    compareDates
} from '../../utils/date-ymd';
import {translate} from "../../i18n";

export default class DateRangePicker extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            startDate: props.defaultDateRange[0],
            endDate: props.defaultDateRange[1],
            focusedStartDate: null,
            focusedEndDate: null,
            syncFrom: null
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.dateRange === undefined) {
            return null;
        }

        if (datesAreEqual(props.dateRange[0], state.startDate)
            && datesAreEqual(props.dateRange[1], state.endDate)
        ) {
            return null;
        }

        state.startDate = props.dateRange[0];
        state.endDate = props.dateRange[1];
        state.syncFrom = 'propsChange';

        return state;
    }

    componentDidUpdate() {
        if (this.state.syncFrom === 'propsChange') {
            this.setState({syncFrom: null});
        }
    }

    sync = (values, syncFrom) => {
        this.setState(
            {...values, syncFrom},
            () => {
                this.setState({syncFrom: null});
                this.props.onChange([this.state.startDate, this.state.endDate]);
            }
        );
    };

    syncNeeded = (name) => {
        const {syncFrom} = this.state;
        return syncFrom !== null && syncFrom !== name;
    };

    checkStartDateError = (newStartDate) => {
        const {getStartDateError} = this.props;
        const {endDate, focusedEndDate} = this.state;

        const contextEndDate = (focusedEndDate && this.checkEndDateError(focusedEndDate) === null)
            ? focusedEndDate : endDate;

        if (!(dateIsNull(contextEndDate) || compareDates(newStartDate, contextEndDate) <= 0)) {
            return translate('Start date cannot be greater than end date');
        }

        return getStartDateError([newStartDate, contextEndDate]);
    };

    checkEndDateError = (newEndDate) => {
        const {getEndDateError} = this.props;
        const {startDate, focusedStartDate} = this.state;

        const contextStartDate = (focusedStartDate && this.checkStartDateError(focusedStartDate) === null)
            ? focusedStartDate : startDate;

        if (!(dateIsNull(contextStartDate) || compareDates(contextStartDate, newEndDate) <= 0)) {
            return translate('End date cannot be less than start date');
        }

        return getEndDateError([contextStartDate, newEndDate]);
    };

    render() {
        const {startDate, endDate, focusedStartDate, focusedEndDate} = this.state;

        const isPicked = !dateIsNull(startDate) || !dateIsNull(endDate);

        return <div
            className={
                'date-range-picker'
                + (isPicked ? ' is-picked' : '')
            }
        >
            <div className="pickers">
                <div
                    className={
                        'start-col'
                        + (focusedEndDate ? ' is-end-focused' : '')
                    }
                >
                    <DatePicker
                        defaultDate={startDate}
                        date={this.syncNeeded('startPicker') ? startDate : undefined}
                        pairedDate={focusedEndDate || endDate}
                        onFocusDate={(focusedStartDate) => {
                            this.setState({focusedStartDate});
                        }}
                        onBlurDate={() => {
                            this.setState({focusedStartDate: null});
                        }}
                        onChange={(startDate) => {
                            this.sync({startDate}, 'startPicker');
                        }}
                        getDateError={this.checkStartDateError}
                    />
                </div>
                <div
                    className={
                        'end-col'
                        + (focusedStartDate ? ' is-start-focused' : '')
                    }
                >
                    <DatePicker
                        defaultDate={endDate}
                        date={this.syncNeeded('endPicker') ? endDate : undefined}
                        pairedDate={focusedStartDate || startDate}
                        onFocusDate={(focusedEndDate) => {
                            this.setState({focusedEndDate});
                        }}
                        onBlurDate={() => {
                            this.setState({focusedEndDate: null});
                        }}
                        onChange={(endDate) => {
                            this.sync({endDate}, 'endPicker');
                        }}
                        getDateError={this.checkEndDateError}
                    />
                </div>
            </div>
        </div>;
    }
}


DateRangePicker.defaultProps = {
    defaultDateRange: [[null, null, null], [null, null, null]],
    dateRange: undefined,
    onChange: ([startDate, endDate]) => console.log('(DateRangePicker) onChange is omitted', [startDate, endDate]),
    getStartDateError: ([startDate, endDate]) => null,
    getEndDateError: ([startDate, endDate]) => null
};

