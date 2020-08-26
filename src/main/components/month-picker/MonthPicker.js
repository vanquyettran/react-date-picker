import './MonthPicker.less';
import React from 'react';
import {translate} from '../../i18n';
import Icon from '../../components/icon/Icon';
import YearPicker from "../year-picker/YearPicker";
import {MAX_YEAR, MIN_YEAR} from "../../view-constants/date-time/limitations";

export default class MonthPicker extends React.Component {

    constructor(props) {
        super(props);

        const [pickedYear, pickedMonth] = props.defaultMonth;

        this.state = {
            pickedYear,
            pickedMonthIndex: pickedMonth - 1,
            shownYear: pickedYear,
            isPicked: pickedYear !== null && pickedMonth !== null,
            yearPickerShown: false,
            syncShownYearFrom: null
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.month === undefined) {
            return null;
        }

        if (props.month === null) {
            state.isPicked = false;

            return state;
        }

        const [pickedYear, pickedMonth] = props.month;

        state.pickedYear = pickedYear;
        state.pickedMonthIndex = pickedMonth - 1;
        state.shownYear = pickedYear;
        state.syncShownYearFrom = 'propsChange';
        state.isPicked = pickedYear !== null && pickedMonth !== null;

        return state;
    }

    componentDidUpdate() {
        if (this.state.syncShownYearFrom === 'propsChange') {
            this.setState({syncShownYearFrom: null});
        }
    }

    syncShownYear = (shownYear, syncShownYearFrom) => {
        this.setState({
            shownYear,
            syncShownYearFrom
        }, () => {
            this.setState({syncShownYearFrom: null});
        });
    };

    syncShownYearNeeded = (name) => {
        const {syncShownYearFrom} = this.state;
        return syncShownYearFrom !== null && syncShownYearFrom !== name;
    };

    showPrevYear = () => {
        this.setState(prevState => ({
            shownYear: prevState.shownYear - 1
        }));
    };

    showNextYear = () => {
        this.setState(prevState => ({
            shownYear: prevState.shownYear + 1
        }));
    };

    canShowPrevYear = () => {
        const {shownYear} = this.state;

        return shownYear > 1;
    };

    canShowNextYear = () => {
        const {shownYear} = this.state;

        return shownYear < 9999;
    };

    pickMonth = (year, monthIndex) => {
        const {onChange} = this.props;

        this.setState({
            pickedYear: year,
            pickedMonthIndex: monthIndex
        }, () => {
            onChange(this.state.pickedYear, this.state.pickedMonthIndex + 1);
        });
    };

    showYearPicker = () => {
        this.setState(
            {yearPickerShown: true},
            () => this.props.onSwitchPicker()
        );
    };

    checkMonthError([year, month]) {
        if (year < MIN_YEAR) {
            return translate('Only support from ::minYear onwards', {minYear: MIN_YEAR});
        }

        if (year > MAX_YEAR) {
            return translate('Only support from ::maxYear back', {maxYear: MAX_YEAR});
        }

        return this.props.getMonthError([year, month]);
    }

    render() {
        const {shortMonths} = this.props;
        const {shownYear, pickedYear, pickedMonthIndex, isPicked, yearPickerShown} = this.state;

        if (yearPickerShown) {
            return <YearPicker
                defaultYear={shownYear}
                year={this.syncShownYearNeeded('yearPicker') ? shownYear : undefined}
                onChange={(year) => {
                    setTimeout(() => {
                        this.syncShownYear(year, 'yearPicker');
                        this.setState(
                            {yearPickerShown: false},
                            () => this.props.onSwitchPicker()
                        );
                    }, 100);
                }}
                getYearError={year => {
                    for (let month = 1; month <= 12; month++) {
                        const error = this.checkMonthError([year, month]);
                        if (error === null) return null;
                    }

                    return translate('All months in this year are invalid');
                }}
            />;
        }


        return <div className={'month-picker' + (isPicked ? ' is-picked' : '')}>
            <table>
                <tbody>
                <tr>
                    <td
                        className="year-backward-cell"
                        onClick={() => this.canShowPrevYear() && this.showPrevYear()}
                    >
                        {
                            this.canShowPrevYear() &&
                            <Icon name="angle-left"/>
                        }
                    </td>
                    <td
                        className="year-cell"
                        colSpan="4"
                        onClick={() => this.showYearPicker()}
                    >
                        {shownYear}
                    </td>
                    <td className="year-forward-cell" onClick={() => this.canShowNextYear() &&this.showNextYear()}>
                        {
                            this.canShowNextYear() &&
                            <Icon name="angle-right"/>
                        }
                    </td>
                </tr>
                <tr>
                    <td/>
                    <td/>
                    <td/>
                    <td/>
                    <td/>
                    <td/>
                </tr>
                {
                    [
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                    ].map(
                        (quarter, quarterIndex) => <tr key={quarterIndex}>
                            {
                                quarter.map(
                                    (_, index) => {
                                        const monthIndex = quarterIndex * 3 + index;
                                        const isPickedMonth = shownYear === pickedYear && monthIndex === pickedMonthIndex;
                                        const error = this.checkMonthError([shownYear, monthIndex + 1]);
                                        const now = new Date();
                                        const isCurrentMonth = now.getFullYear() === shownYear && now.getMonth() === monthIndex;

                                        return <td
                                            key={monthIndex}
                                            className={
                                                'month-cell'
                                                + (isPickedMonth ? ' is-picked-month' : '')
                                                + (isCurrentMonth ? ' is-current-month' : '')
                                                + (error === null ? ' is-valid' : '')
                                            }
                                            aria-label={error !== null ? error : undefined}
                                            colSpan="2"
                                            onClick={() => error === null && this.pickMonth(shownYear, monthIndex)}
                                        >
                                            {shortMonths[monthIndex]}
                                        </td>;
                                    }
                                )
                            }
                        </tr>
                    )
                }
                </tbody>
            </table>
        </div>;
    }
}

MonthPicker.defaultProps = {
    defaultMonth: [new Date().getFullYear(), new Date().getMonth() + 1],
    month: undefined,
    getMonthError: ([year, month]) => null,
    onChange: ([year, month]) => console.log('(MonthPicker) onChange is omitted', [year, month]),
    onSwitchPicker: () => {},
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
};

