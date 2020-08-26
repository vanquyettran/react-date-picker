import './DateRangePresetPicker.less';
import React from 'react';
import {translate} from '../../i18n';
import moment from 'moment';
import {STANDARD_DATE_FORMAT} from '../../view-constants/date-time/formats';
import {
    stringToDate,
    dateToString,
    dateToDisplayedString,
    dateIsNull,
    datesAreEqual,
    compareDates,
    countDaysOfDateRange,
    getToday
} from '../../utils/date-ymd';
import TabbedView from "../tabbed-view/TabbedView";

export default class DateRangePresetPicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dateRange: props.defaultDateRange,
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.dateRange === undefined) {
            return null;
        }

        const [startDate, endDate] = props.dateRange;

        if (datesAreEqual(startDate, state.dateRange[0]) && datesAreEqual(endDate, state.dateRange[1])) {
            return null;
        }

        state.dateRange = [startDate, endDate];

        return state;
    }

    pushChange = () => {
        const {onChange} = this.props;

        onChange(this.state.dateRange);
    };

    setDateRange = (dateRange) => {
        this.setState({dateRange}, () => {
            this.pushChange();
        });
    };

    getDateRangeText = ([startDate, endDate]) => {
        if (datesAreEqual(startDate, endDate)) {
            return dateToDisplayedString(startDate);
        }

        return dateToDisplayedString(startDate) + ' - ' + dateToDisplayedString(endDate);
    };

    getFrequentlyUsedGroup = () => {
        const {frequentlyUsedPresetKeys} = this.props;

        const frequentlyUsedGroupItems = frequentlyUsedPresetKeys.filter(presetKey => PRESETS.hasOwnProperty(presetKey));

        if (frequentlyUsedGroupItems.length > 8) {
            frequentlyUsedGroupItems.length = Math.min(frequentlyUsedGroupItems.length, 8);
        } else if (frequentlyUsedGroupItems.length > 4) {
            frequentlyUsedGroupItems.length = Math.min(frequentlyUsedGroupItems.length, 4);
        } else {
            frequentlyUsedGroupItems.length = 0;
        }

        return {
            name: translate('Frequently'),
            items: frequentlyUsedGroupItems
        };
    };

    /**
     *
     * @return {Array}
     */
    getFinalPresetGroups = () => {
        const {presetGroups} = this.props;

        const finalPresetGroups = [];

        finalPresetGroups.push(this.getFrequentlyUsedGroup());
        finalPresetGroups.push(...presetGroups);

        return finalPresetGroups.filter(group => {
            return group.items
                .filter(presetKey => PRESETS.hasOwnProperty(presetKey)) // in case we update code, PRESETS would have been changed
                .length > 0;
        });
    };

    render() {
        const {apply, getDateRangeError} = this.props;
        const {dateRange} = this.state;

        const finalPresetGroups = this.getFinalPresetGroups();

        return <div className="date-range-preset-picker">
            {
                finalPresetGroups.map(group => {
                    return <div className="preset-group" key={group.name}>
                        <div className="group-name">{group.name}</div>
                        <div className="group-content">
                            <ul className="clear-fix">
                                {
                                    group.items.map((presetKey) => {
                                        const [rangeName, startDate, endDate] = PRESETS[presetKey];

                                        const isPicked = datesAreEqual(dateRange[0], startDate) && datesAreEqual(dateRange[1], endDate);
                                        const error = getDateRangeError([startDate, endDate]);
                                        return <li
                                            key={rangeName}
                                            onClick={() => error === null && (isPicked && apply ? apply() : this.setDateRange([startDate, endDate]))}
                                            className={(isPicked ? ' is-picked' : '') + (error === null ? ' is-valid' : '')}
                                            aria-label={error !== null ? error : (isPicked && apply ? translate('Click to apply') : this.getDateRangeText([startDate, endDate]))}
                                        >
                                            {rangeName}
                                        </li>;
                                    })
                                }
                            </ul>
                        </div>
                    </div>;
                })
            }
        </div>;
    }
}

DateRangePresetPicker.defaultProps = {
    defaultDateRange: [moment(), moment()].map(t => [t.year(), t.month() + 1, t.date()]),
    dateRange: undefined,
    onChange: ([startDate, endDate]) => console.log('(DateRangePresetPicker) onChange is omitted', [startDate, endDate]),
    frequentlyUsedPresetKeys: [],
    presetGroups: [
        {
            name: translate('Day'),
            items: [
                'today',
                'yesterday',
                '2_days_ago',
                '3_days_ago',
                'this_day_last_week',
                'this_day_2_weeks_ago',
                'this_day_3_weeks_ago',
                'this_day_4_weeks_ago',
                'last_10_days',
                'last_20_days',
                'last_30_days',
                'last_50_days',
                'last_100_days',
                'last_200_days',
                'last_300_days',
                'last_500_days',
            ]
        },
        {
            name: translate('Week'),
            items: [
                'this_week',
                'last_week',
                '2_weeks_ago',
                '3_weeks_ago',
                'from_1_week_ago',
                'from_2_weeks_ago',
                'from_3_weeks_ago',
                'from_4_weeks_ago',
            ]
        },
        {
            name: translate('Month'),
            items: [
                'this_month',
                'last_month',
                '2_months_ago',
                '3_months_ago',
                'from_1_month_ago',
                'from_2_months_ago',
                'from_3_months_ago',
                'from_4_months_ago',
                'from_5_months_ago',
                'from_6_months_ago',
                'from_8_months_ago',
                'from_10_months_ago',
            ]
        },
        {
            name: translate('Year'),
            items: [
                'this_year',
                'last_year',
                '2_years_ago',
                '3_years_ago',
                'from_1_year_ago',
                'from_2_years_ago',
                'from_3_years_ago',
                'from_4_years_ago',
            ]
        },
    ],
};


const PRESETS = (() => {
    const presets = {
        'today': [translate('Today'), moment(), moment()],
        'yesterday': [translate('Yesterday'), moment().subtract(1, 'day'), moment().subtract(1, 'day')],
        '2_days_ago': [translate('2 days ago'), moment().subtract(2, 'day'), moment().subtract(2, 'day')],
        '3_days_ago': [translate('3 days ago'), moment().subtract(3, 'day'), moment().subtract(3, 'day')],
        'this_day_last_week': [translate('This day last week'), moment().subtract(1, 'week'), moment().subtract(1, 'week')],
        'this_day_2_weeks_ago': [translate('This day 2 weeks ago'), moment().subtract(2, 'week'), moment().subtract(2, 'week')],
        'this_day_3_weeks_ago': [translate('This day 3 weeks ago'), moment().subtract(3, 'week'), moment().subtract(3, 'week')],
        'this_day_4_weeks_ago': [translate('This day 4 weeks ago'), moment().subtract(4, 'week'), moment().subtract(4, 'week')],

        'last_10_days': [translate('Last 10 days'), moment().subtract(9, 'day'), moment()],
        'last_20_days': [translate('Last 20 days'), moment().subtract(19, 'day'), moment()],
        'last_30_days': [translate('Last 30 days'), moment().subtract(29, 'day'), moment()],
        'last_50_days': [translate('Last 50 days'), moment().subtract(49, 'day'), moment()],
        'last_100_days': [translate('Last 100 days'), moment().subtract(99, 'day'), moment()],
        'last_200_days': [translate('Last 200 days'), moment().subtract(199, 'day'), moment()],
        'last_300_days': [translate('Last 300 days'), moment().subtract(299, 'day'), moment()],
        'last_500_days': [translate('Last 500 days'), moment().subtract(499, 'day'), moment()],

        'this_week': [translate('This week'), moment().startOf('week'), moment().endOf('week')],
        'last_week': [translate('Last week'), moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
        '2_weeks_ago': [translate('2 weeks ago'), moment().subtract(2, 'week').startOf('week'), moment().subtract(2, 'week').endOf('week')],
        '3_weeks_ago': [translate('3 weeks ago'), moment().subtract(3, 'week').startOf('week'), moment().subtract(3, 'week').endOf('week')],
        'from_1_week_ago': [translate('From 1 week ago'), moment().subtract(1, 'week'), moment()],
        'from_2_weeks_ago': [translate('From 2 weeks ago'), moment().subtract(2, 'week'), moment()],
        'from_3_weeks_ago': [translate('From 3 weeks ago'), moment().subtract(3, 'week'), moment()],
        'from_4_weeks_ago': [translate('From 4 weeks ago'), moment().subtract(4, 'week'), moment()],

        'this_month': [translate('This month'), moment().startOf('month'), moment().endOf('month')],
        'last_month': [translate('Last month'), moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
        '2_months_ago': [translate('2 months ago'), moment().subtract(2, 'month').startOf('month'), moment().subtract(2, 'month').endOf('month')],
        '3_months_ago': [translate('3 months ago'), moment().subtract(3, 'month').startOf('month'), moment().subtract(3, 'month').endOf('month')],
        'from_1_month_ago': [translate('From 1 month ago'), moment().subtract(1, 'month'), moment()],
        'from_2_months_ago': [translate('From 2 months ago'), moment().subtract(2, 'month'), moment()],
        'from_3_months_ago': [translate('From 3 months ago'), moment().subtract(3, 'month'), moment()],
        'from_4_months_ago': [translate('From 4 months ago'), moment().subtract(4, 'month'), moment()],
        'from_5_months_ago': [translate('From 5 months ago'), moment().subtract(5, 'month'), moment()],
        'from_6_months_ago': [translate('From 6 months ago'), moment().subtract(6, 'month'), moment()],
        'from_8_months_ago': [translate('From 8 months ago'), moment().subtract(8, 'month'), moment()],
        'from_10_months_ago': [translate('From 10 months ago'), moment().subtract(10, 'month'), moment()],

        'this_year': [translate('This year'), moment().startOf('year'), moment().endOf('year')],
        'last_year': [translate('Last year'), moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
        '2_years_ago': [translate('2 years ago'), moment().subtract(2, 'year').startOf('year'), moment().subtract(2, 'year').endOf('year')],
        '3_years_ago': [translate('3 years ago'), moment().subtract(3, 'year').startOf('year'), moment().subtract(3, 'year').endOf('year')],
        'from_1_year_ago': [translate('From 1 year ago'), moment().subtract(1, 'year'), moment()],
        'from_2_years_ago': [translate('From 2 years ago'), moment().subtract(2, 'year'), moment()],
        'from_3_years_ago': [translate('From 3 years ago'), moment().subtract(3, 'year'), moment()],
        'from_4_years_ago': [translate('From 4 years ago'), moment().subtract(4, 'year'), moment()],
    };

    for (let key in presets) {
        if (presets.hasOwnProperty(key)) {
            const [name, start, end] = presets[key];

            presets[key] = [
                name,
                [start.year(), start.month() + 1, start.date()],
                [end.year(), end.month() + 1, end.date()]
            ]
        }
    }

    return presets;
})();

function getPresetInfoOfDateRange([startDate, endDate]) {
    for (let key in PRESETS) {
        if (PRESETS.hasOwnProperty(key)) {
            const [presetName, presetStartDate, presetEndDate] = PRESETS[key];

            if (datesAreEqual(presetStartDate, startDate) && datesAreEqual(presetEndDate, endDate)) {
                return {
                    key: key,
                    name: presetName
                };
            }
        }
    }

    return null;
}

export {
    getPresetInfoOfDateRange
}
