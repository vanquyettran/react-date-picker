import './DatePicker.less';
import React from 'react';
import {translate} from '../../i18n';
import Icon from '../../components/icon/Icon';
import MonthPicker from '../../components/month-picker/MonthPicker';
import {compareDates, dateIsNull, dateToString} from "../../utils/date-ymd";
import {getLastDayOfMonth} from "../../utils/date-time";
import {MAX_YEAR, MIN_YEAR} from "../../view-constants/date-time/limitations";

export default class DatePicker extends React.Component {
    constructor(props) {
        super(props);

        let [dateObject, isPicked] = this.getDefaultDateObjectAndIsPicked();

        this.state = {};
        this.state.pickedDate = dateObject;
        this.state.isPicked = isPicked;
        this.state.shownYear = this.getPickedYear();
        this.state.shownMonthIndex = this.getPickedMonthIndex();
        this.state.monthPickerShown = false;
        this.state.syncShownMonthFrom = null;
        this.state.focusedYMD = null;

        // when mount, size and position of elements are not stable
        // mouse pointer might touch on a cell unintentionally
        // that lead to jumping of focused cell
        // or when back from month picker
        // focused cell is unintended
        // so, this flag used to indicate that we should disable mouse event
        // when users hover on container element, this will be enabled again
        this.state.mouseEventDisabledTemporarily = true;

        this.state.dateFocusingDisabledTemporarily = true;
    }

    getDefaultDateObjectAndIsPicked = () => {
        const {defaultDate} = this.props;

        if (dateIsNull(defaultDate)) {
            return [new Date(), false];
        }

        const dateObject = new Date(dateToString(defaultDate));

        const isNotValid = isNaN(dateObject.getTime());
        if (isNotValid) {
            return [new Date(), false];
        }

        return [dateObject, true];
    };

    static getDerivedStateFromProps(props, state) {
        if (props.date === undefined) {
            return null;
        }

        if (dateIsNull(props.date)) {
            state.isPicked = false;

            return state;
        }

        const dateObject = new Date(dateToString(props.date));

        if (isNaN(dateObject.getTime())) {
            state.isPicked = false;

            return state;
        }

        state.pickedDate = dateObject;
        state.shownYear = state.pickedDate.getFullYear();
        state.shownMonthIndex = state.pickedDate.getMonth();
        state.syncShownMonthFrom = 'propsChange';
        state.isPicked = true;

        return state;
    }

    componentDidUpdate() {
        if (this.state.syncShownMonthFrom === 'propsChange') {
            this.setState({syncShownMonthFrom: null});
        }
    }

    syncShownMonth = (shownYear, shownMonthIndex, syncShownMonthFrom) => {
        this.setState({
            shownYear,
            shownMonthIndex,
            syncShownMonthFrom
        }, () => {
            this.setState({syncShownMonthFrom: null});
        });
    };

    syncShownMonthNeeded = (name) => {
        const {syncShownMonthFrom} = this.state;
        return syncShownMonthFrom !== null && syncShownMonthFrom !== name;
    };

    /**
     * @return {number}
     */
    getPickedYear = () => this.state.pickedDate.getFullYear();

    /**
     * @return {number}
     */
    getPickedMonthIndex = () => this.state.pickedDate.getMonth();

    /**
     * @return {number}
     */
    getPickedDate = () => this.state.pickedDate.getDate();

    setPickedYear = year => this.state.pickedDate.setFullYear(year);

    setPickedMonthIndex = monthIndex => this.state.pickedDate.setMonth(monthIndex);

    setPickedDate = date => this.state.pickedDate.setDate(date);

    updatePickedYMD = ([year, month, date]) => {
        this.setPickedYear(year);
        this.setPickedMonthIndex(month - 1);
        this.setPickedDate(date);

        this.setState({
            isPicked: true,
            dateFocusingDisabledTemporarily: true
        });

        if (this.shouldResetShownYearMonth()) {
            setTimeout(this.resetShownYearMonth, 100);
        }

        setTimeout(this.pushChange, 0);
    };

    pushChange = () => {
        this.props.onChange(this.getPickedYMD());
    };

    shouldResetShownYearMonth = () => {
        const pickedYear = this.getPickedYear();
        const pickedMonthIndex = this.getPickedMonthIndex();

        const {shownYear, shownMonthIndex} = this.state;

        return !(pickedYear === shownYear && pickedMonthIndex === shownMonthIndex);
    };

    resetShownYearMonth = () => {
        this.setState({
            shownYear: this.getPickedYear(),
            shownMonthIndex: this.getPickedMonthIndex(),
            mouseEventDisabledTemporarily: true
        });
    };

    enableDateFocusing = () => {
        if (this.state.dateFocusingDisabledTemporarily) {
            this.setState({dateFocusingDisabledTemporarily: false});
        }
    };

    enableMouseEvent = () => {
        if (this.state.mouseEventDisabledTemporarily) {
            this.setState({mouseEventDisabledTemporarily: false});
        }
    };

    getCalendar = () => {
        const {
            shownYear,
            shownMonthIndex
        } = this.state;

        return createCalendar(
            shownYear,
            shownMonthIndex
        );
    };

    getPairedYMD = () => {
        const {pairedDate} = this.props;

        if (!pairedDate || dateIsNull(pairedDate)) {
            return null;
        }

        const date = new Date(dateToString(pairedDate));

        if (isNaN(date.getTime())) {
            return null;
        }

        return [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        ];
    };

    getPickedYMD = () => {
        return [
            this.getPickedYear(),
            this.getPickedMonthIndex() + 1,
            this.getPickedDate()
        ];
    };

    showPrevMonth = () => {
        this.setState(({shownYear, shownMonthIndex}) => {
            if (shownMonthIndex === 0) {
                shownMonthIndex = 11;
                shownYear--;
            } else {
                shownMonthIndex--;
            }
            return {shownYear, shownMonthIndex};
        });
    };

    showNextMonth = () => {
        this.setState(({shownYear, shownMonthIndex}) => {
            if (shownMonthIndex === 11) {
                shownMonthIndex = 0;
                shownYear++;
            } else {
                shownMonthIndex++;
            }
            return {shownYear, shownMonthIndex};
        });
    };

    showMonthPicker = () => {
        this.setState(
            {monthPickerShown: true},
            () => this.props.onSwitchPicker()
        );
    };

    setFocusedYMD = ([year, month, date]) => {
        if (this.state.dateFocusingDisabledTemporarily) {
            return;
        }

        this.setState(
            {
                focusedYMD: [year, month, date]
            },
            this.props.onFocusDate([year, month, date]),
        );
    };

    removeFocusedYMD = ([year, month, date]) => {
        this.setState(
            {
                focusedYMD: null
            },
            this.props.onBlurDate([year, month, date])
        );
    };

    checkDateError = ([year, month, date]) => {
        if (year < MIN_YEAR) {
            return translate('Only support from ::minYear onwards', {minYear: MIN_YEAR});
        }

        if (year > MAX_YEAR) {
            return translate('Only support from ::maxYear back', {maxYear: MAX_YEAR});
        }

        return this.props.getDateError([year, month, date]);
    };

    getDateHint = ([year, month, date]) => {
        return this.props.getDateHint([year, month, date]);
    };

    render() {
        const {
            shortWeekdays,
            shortMonths,
            months,
            yearMonthTemplate,
        } = this.props;

        const {
            shownYear,
            shownMonthIndex,
            isPicked,
            monthPickerShown,
            focusedYMD,
            mouseEventDisabledTemporarily,
            dateFocusingDisabledTemporarily
        } = this.state;

        if (monthPickerShown) {
            return <MonthPicker
                defaultMonth={[shownYear, shownMonthIndex + 1]}
                month={this.syncShownMonthNeeded('monthPicker') ? [shownYear, shownMonthIndex + 1] : undefined}
                onChange={(year, month) => {
                    setTimeout(() => {
                        this.syncShownMonth(year, month - 1, 'monthPicker');
                        this.setState(
                            {
                                monthPickerShown: false,
                                mouseEventDisabledTemporarily: true
                            },
                            () => this.props.onSwitchPicker()
                        );
                    }, 100);
                }}
                getMonthError={([year, month]) => {
                    const errors = [];
                    for (let date = 1; date <= getLastDayOfMonth([year, month]); date++) {
                        const error = this.checkDateError([year, month, date]);
                        if (error === null) return null;
                        if (!errors.includes(error)) errors.push(error);
                    }

                    return translate('All days in this month are invalid: ::errors', {errors});
                }}
                onSwitchPicker={() => this.props.onSwitchPicker()}
            />;
        }

        return <div
            className={
                'date-picker'
                + (isPicked ? ' is-picked' : '')
                + (this.getPairedYMD() ? ' is-paired' : '')
                + (focusedYMD ? ' is-focused' : '')
            }
            onMouseMove={mouseEventDisabledTemporarily ? () => this.enableMouseEvent() : undefined}
        >
            <table
                style={{pointerEvents: mouseEventDisabledTemporarily ? 'none' : 'unset'}}
            >
                <tbody>
                {
                    getYearMonthRow(
                        yearMonthTemplate, shownYear,
                        shownMonthIndex, months, shortMonths,
                        this.showPrevMonth, this.showNextMonth,
                        this.showMonthPicker
                    )
                }
                </tbody>
                <tbody
                    onMouseEnter={dateFocusingDisabledTemporarily ? ev => this.enableDateFocusing() : undefined}
                >
                {
                    getWeekdaysRow(shortWeekdays)
                }
                {
                    this.getCalendar().map(
                        (weekInfo, index) => getWeekRow(
                            index,
                            weekInfo,
                            this.checkDateError,
                            this.getDateHint,
                            this.getPickedYMD(),
                            this.getPairedYMD(),
                            focusedYMD,
                            this.updatePickedYMD,
                            this.setFocusedYMD,
                            this.removeFocusedYMD
                        )
                    )
                }
                </tbody>
            </table>
        </div>;
    }
}


DatePicker.defaultProps = {
    defaultDate: [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()],
    date: undefined,
    pairedDate: undefined,
    yearMonthTemplate: '{shortMonth} {year}',
    getDateError: ([year, month, date]) => null,
    getDateHint: ([year, month, date]) => null,
    onChange: ([year, month, date]) => console.log('(DatePicker) onChange is omitted', value),
    onFocusDate: ([year, month, date]) => {},
    onBlurDate: ([year, month, date]) => {},
    onSwitchPicker: () => {},
    shortWeekdays: [
        translate("weekday_su"),
        translate("weekday_mo"),
        translate("weekday_tu"),
        translate("weekday_we"),
        translate("weekday_th"),
        translate("weekday_fr"),
        translate("weekday_sa")
    ],
    shortMonths: [
        translate("month_jan"),
        translate("month_feb"),
        translate("month_mar"),
        translate("month_apr"),
        translate("month_may"),
        translate("month_jun"),
        translate("month_jul"),
        translate("month_aug"),
        translate("month_sep"),
        translate("month_oct"),
        translate("month_nov"),
        translate("month_dec")
    ],
    months: [
        translate("January"),
        translate("February"),
        translate("March"),
        translate("April"),
        translate("May"),
        translate("June"),
        translate("July"),
        translate("August"),
        translate("September"),
        translate("October"),
        translate("November"),
        translate("December")
    ],
};


/**
 *
 * @param {string} yearMonthTemplate
 * @param {number} shownYear
 * @param {number} shownMonthIndex
 * @param {string[]} months
 * @param {string[]} shortMonths
 * @param {function|null} showPrevMonth
 * @param {function|null} showNextMonth
 * @param {function} showMonthPicker
 */
function getYearMonthRow(yearMonthTemplate, shownYear, shownMonthIndex, months, shortMonths, showPrevMonth, showNextMonth, showMonthPicker) {
    return <tr className="year-month-row">
        <td className="month-backward-cell" onClick={() => showPrevMonth && showPrevMonth()}>
            {
                showPrevMonth &&
                <Icon name="angle-left"/>
            }
        </td>
        <td className="year-month-cell" colSpan="5" onClick={() => showMonthPicker()}>
            {
                yearMonthTemplate
                    .replace(/\{year\}/g, '' + shownYear)
                    .replace(/\{month\}/g, months[shownMonthIndex])
                    .replace(/\{shortMonth\}/g, shortMonths[shownMonthIndex])
            }
        </td>
        <td className="month-forward-cell" onClick={() => showNextMonth && showNextMonth()}>
            {
                showNextMonth &&
                <Icon name="angle-right"/>
            }
        </td>
    </tr>
}


/**
 *
 * @param shortWeekdays
 * @returns {Component}
 */
function getWeekdaysRow(shortWeekdays) {
    return <tr className="weekdays-row">
        {
            shortWeekdays.map(wd => <td key={wd} className="weekday-cell">
                {wd}
            </td>)
        }
    </tr>;
}


/**
 *
 * @param {number} weekIndex
 * @param {{year, monthIndex, date, isInShownMonth, isToday}[]} dateInfoList
 * @param {function} checkDateError
 * @param {function} getDateHint
 * @param {Array} pickedYMD
 * @param {Array} pairedYMD
 * @param {Array} focusedYMD
 * @param {function} updatePickedYMD
 * @param {function} setFocusedYMD
 * @param {function} removeFocusedYMD
 * @returns {Component}
 */
function getWeekRow(
    weekIndex,
    dateInfoList,
    checkDateError,
    getDateHint,
    pickedYMD,
    pairedYMD,
    focusedYMD,
    updatePickedYMD,
    setFocusedYMD,
    removeFocusedYMD
) {

    const getAriaLabel = (itemYMD, error) => {
        if (error !== null) return error;

        const hint = getDateHint(itemYMD);

        if (hint !== null) return hint;

        return undefined;
    };

    return <tr className="week-row" key={weekIndex}>
        {
            dateInfoList.map(({year, monthIndex, date, isInShownMonth, isToday}) => {
                const itemYMD = [year, monthIndex + 1, date];

                const error = checkDateError(itemYMD);

                const isPickedDate = compareDates(itemYMD, pickedYMD) === 0;
                const isAfterPickedDate = compareDates(itemYMD, pickedYMD) > 0;

                const isPairedDate = pairedYMD && compareDates(itemYMD, pairedYMD) === 0;
                const isAfterPairedDate = pairedYMD && compareDates(itemYMD, pairedYMD) > 0;

                const isFocusedDate = focusedYMD && compareDates(itemYMD, focusedYMD) === 0;
                const isAfterFocusedDate = focusedYMD && compareDates(itemYMD, focusedYMD) > 0;

                return <td
                    key={`${year} ${monthIndex} ${date}`}
                    className={
                        'date-cell'
                        + (isInShownMonth ? ' is-in-shown-month' : '')
                        + (isToday ? ' is-today' : '')
                        + (error === null ? ' is-valid' : '')

                        + (isPickedDate ? ' is-picked-date' : '')
                        + (isAfterPickedDate ? ' is-after-picked-date' : '')
                        + ((!isPickedDate && !isAfterPickedDate) ? ' is-before-picked-date' : '')

                        + (isPairedDate ? ' is-paired-date' : '')
                        + (isAfterPairedDate ? ' is-after-paired-date' : '')
                        + ((!isPairedDate && !isAfterPairedDate) ? ' is-before-paired-date' : '')

                        + (isFocusedDate ? ' is-focused-date' : '')
                        + (isAfterFocusedDate ? ' is-after-focused-date' : '')
                        + ((!isFocusedDate && !isAfterFocusedDate) ? ' is-before-focused-date' : '')
                    }
                    onClick={() => error === null && updatePickedYMD(itemYMD)}
                    onMouseOver={() => setFocusedYMD(itemYMD)}
                    onMouseOut={() => removeFocusedYMD(itemYMD)}
                    aria-label={getAriaLabel(itemYMD, error)}
                >
                    {date}
                </td>;
            })
        }
    </tr>
}


/**
 *
 * @param shownYear
 * @param shownMonthIndex
 * @returns {Array}
 */
function createCalendar(shownYear, shownMonthIndex) {
    const now = new Date();
    const calendar = [];
    const threeMonths = [[shownYear, shownMonthIndex]];

    if (shownMonthIndex === 0) {
        threeMonths.unshift([shownYear - 1, 11]);
        threeMonths.push([shownYear, 1]);
    } else if (shownMonthIndex === 11) {
        threeMonths.unshift([shownYear, 10]);
        threeMonths.push([shownYear + 1, 0]);
    } else {
        threeMonths.unshift([shownYear, shownMonthIndex - 1]);
        threeMonths.push([shownYear, shownMonthIndex + 1]);
    }

    let week, day = new Date(threeMonths[0][0], threeMonths[0][1], 1).getDay();

    threeMonths.forEach((item, index) => {
        let maxDate = new Date(item[0], item[1] + 1, 0).getDate();

        for (let i = 1; i <= maxDate; i++) {
            if (week === undefined) {
                if (day < 6) {
                    day ++;
                } else {
                    week = [];
                }
                continue;
            }

            week.push({
                year: item[0],
                monthIndex: item[1],
                date: i,
                isInShownMonth: index === 1,
                isToday: item[0] === now.getFullYear() && item[1] === now.getMonth() && i === now.getDate(),
            });

            if (week.length === 7) {
                calendar.push(week);
                week = [];
            }
        }
    });

    const result = [];
    calendar.some(week => {
        if (week.some(item => item.isInShownMonth)) {
            result.push(week);
        } else if (result.length > 0 && result.length < 6) {
            result.push(week);
        }
    });

    return result;
}
