import './DateRangeSelector.less';
import React from 'react';
import TemplateInput from "../template-input/TemplateInput";
import dateRangeTemplate from "./dateRangeTemplate";
import Icon from "../icon/Icon";
import Dropdown from "../dropdown/Dropdown";
import DateRangePicker from "../date-range-picker/DateRangePicker";
import DateRangePresetPicker, {getPresetInfoOfDateRange} from '../date-range-preset-picker/DateRangePresetPicker';
import {
    dateIsNull,
    datesAreEqual,
    compareDates,
    countDaysOfDateRange,
} from "../../utils/date-ymd";
import {translate} from "../../i18n";
import {setLocalItem, getLocalItem} from '../../utils/local-storage';
import {formatNumberLocalized} from '../../utils/number';
import {MIN_YEAR, MAX_YEAR} from '../../view-constants/date-time/limitations';

export default class DateRangeSelector extends React.Component {
    constructor(props) {
        super(props);

        const [startDate, endDate] = this.props.defaultValue;

        this.state = {
            value: [startDate, endDate],
            fallbackValue: [startDate, endDate],
            lastCommittedValue: [startDate, endDate],
            syncFrom: null,
            pickerShown: false,
            isInPresetMode: getSavedPresetMode(),
        };

        /**
         *
         * @type {HTMLDivElement}
         */
        this.el = null;

        /**
         *
         * @type {HTMLDivElement}
         */
        this.dropdownBottomArea = null;

        /**
         *
         * @type {boolean}
         */
        this.dropdownRefreshed = false;
    }

    static getDerivedStateFromProps(props, state) {
        if (props.value === undefined) {
            return null;
        }

        const [startDate, endDate] = props.value;

        if (datesAreEqual(startDate, state.value[0]) && datesAreEqual(endDate, state.value[1])) {
            return null;
        }

        state.value = [startDate, endDate];
        state.syncFrom = 'propsChange';

        return state;
    }

    componentDidUpdate() {
        if (this.state.syncFrom === 'propsChange') {
            this.setState({syncFrom: null});
        }

        if (this.state.pickerShown && !this.dropdownRefreshed) {
            this.forceUpdate();
        }
    }

    pushChange = () => {
        const {fallbackValue} = this.state;

        this.setState({
            lastCommittedValue: fallbackValue
        });
        this.props.onChange(fallbackValue);

        const presetInfo = getPresetInfoOfDateRange(fallbackValue);
        if (presetInfo) {
            logUseCountForPreset(presetInfo.key);
        }
    };

    discardChange = () => {
        const [startDate, endDate] = this.state.lastCommittedValue;

        this.setState({
            value: [startDate, endDate],
            fallbackValue: [startDate, endDate],
            syncFrom: 'discardChange'
        }, () => {
            this.setState({
                syncFrom: null
            });
        });
    };

    discardChangeAndHidePicker = () => {
        requestAnimationFrame(() => {
            this.discardChange();
            this.hidePicker();
        });
    };

    sync = (startDate, endDate, syncFrom) => {
        // check if partial null
        if (!this.getDateRangeIsNotPartialNull([startDate, endDate])) {
            this.setState(
                {
                    value: [startDate, endDate],
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
        if (this.checkDateRangeError([startDate, endDate]) === null) {
            this.setState({
                fallbackValue: [startDate, endDate]
            });
        }

        this.setState(
            {value: [startDate, endDate], syncFrom},
            () => this.setState(
                {syncFrom: null}
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
        this.sync([null, null, null], [null, null, null], 'clearer');
    };

    getDateRangeIsNotPartialNull = ([startDate, endDate]) => {
        return this.getIsNotPartialNull(startDate) && this.getIsNotPartialNull(endDate);
    };

    getIsNotPartialNull = ([year, month, date]) => {
        return (year !== null && month !== null && date !== null) || (year === null && month === null && date === null);
    };

    checkDateRangeError = ([startDate, endDate]) => {
        return this.checkStartDateError([startDate, endDate]) || this.checkEndDateError([startDate, endDate]);
    };

    checkStartDateError = ([startDate, endDate]) => {
        if (dateIsNull(startDate)) {
            return translate('Start date cannot be empty');
        }

        if (startDate[0] < MIN_YEAR) {
            return translate('Only support from ::minYear onwards', {minYear: MIN_YEAR});
        }


        if (startDate[0] > MAX_YEAR) {
            return translate('Only support from ::maxYear back', {maxYear: MAX_YEAR});
        }

        if (!dateIsNull(endDate) && compareDates(startDate, endDate) > 0) {
            return translate('Start date cannot be greater than end date');
        }

        return this.props.getStartDateError([startDate, endDate]);
    };

    checkEndDateError = ([startDate, endDate]) => {
        if (dateIsNull(endDate)) {
            return translate('End date cannot be empty');
        }

        if (endDate[0] < MIN_YEAR) {
            return translate('Only support from ::minYear onwards', {minYear: MIN_YEAR});
        }


        if (endDate[0] > MAX_YEAR) {
            return translate('Only support from ::maxYear back', {maxYear: MAX_YEAR});
        }

        if (!dateIsNull(startDate) && compareDates(startDate, endDate) > 0) {
            return translate('End date cannot be less than start date');
        }

        return this.props.getEndDateError([startDate, endDate]);
    };

    switchToPreset = (callback) => {
        this.setState(
            {isInPresetMode: true},
            () => {
                callback && callback();
                savePresetMode(this.state.isInPresetMode);
            }
        );
    };

    switchToCustom = (callback) => {
        this.setState(
            {isInPresetMode: false},
            () => {
                callback && callback();
                savePresetMode(this.state.isInPresetMode);
            }
        );
    };

    getResultText = () => {
        const [startDate, endDate] = this.state.value;

        if (dateIsNull(startDate) || dateIsNull(endDate)) {
            return translate('No period has been chosen');
        }

        const pickedPresetInfo = getPresetInfoOfDateRange([startDate, endDate]);
        const pickedNumDays = countDaysOfDateRange([startDate, endDate]);

        if (pickedPresetInfo === null) {
            if (pickedNumDays > 1) {
                return translate('Choosing: ::numOfDays days', {
                    numOfDays: formatNumberLocalized(pickedNumDays),
                });
            }

            return translate('Choosing: ::numOfDays day', {
                numOfDays: formatNumberLocalized(pickedNumDays),
            });
        }

        if (pickedNumDays > 1) {
            return translate('Choosing: ::numOfDays days (::presetName)', {
                numOfDays: formatNumberLocalized(pickedNumDays),
                presetName: pickedPresetInfo.name
            });
        }

        return translate('Choosing: ::numOfDays day (::presetName)', {
            numOfDays: formatNumberLocalized(pickedNumDays),
            presetName: pickedPresetInfo.name
        });
    };

    handleEnterToApply = () => {
        if (document.activeElement) {
            document.activeElement.blur();
        }

        this.setState({
            syncFrom: 'onEnter'
        });

        setTimeout(() => {
            this.pushChange();
            this.hidePicker();
        }, 0);
    };

    render() {
        const {disabled, dropdownHorizontalAlignment} = this.props;
        const {value, pickerShown, isInPresetMode} = this.state;

        const [startDate, endDate] = value;

        const isEmpty = startDate.every(t => t === null) && endDate.every(t => t === null);

        const templateInputValue = {
            year1: startDate[0],
            month1: startDate[1],
            date1: startDate[2],
            year2: endDate[0],
            month2: endDate[1],
            date2: endDate[2],
        };

        const error = this.checkDateRangeError([startDate, endDate]);

        return <div
            className={
                'date-range-selector'
                + (pickerShown ? ' focused' : '')
                + (isEmpty ? ' is-empty' : '')
                + (disabled ? ' disabled' : '')
            }
            ref={el => this.el = el}
        >
            <TemplateInput
                template={dateRangeTemplate}
                defaultValues={templateInputValue}
                values={this.syncNeeded('templateInput') ? templateInputValue : undefined}
                onChange={({year1, month1, date1, year2, month2, date2}) => {
                    this.sync([year1, month1, date1], [year2, month2, date2], 'templateInput');
                }}
                onFocus={() => this.showPicker()}
                disabled={disabled}
                onUnhandledKeyDown={(key) => {
                    if (key === 'Enter' && error === null) {
                        this.handleEnterToApply();
                    }
                }}
            />
            <button
                type="button"
                className="calendar-button"
                onClick={() => disabled || this.showPicker()}
            >
                <Icon name="calendar"/>
            </button>
            {
                !disabled &&
                pickerShown &&
                <Dropdown
                    name="date-range-picker"
                    opener={this.el}
                    close={() => {
                        this.discardChangeAndHidePicker();
                    }}
                    horizontalAlignment={dropdownHorizontalAlignment}
                >
                    {
                        (contentViewableMaxHeight, refreshDropdownDisplay) => {
                            this.dropdownRefreshed = !!this.dropdownBottomArea;

                            return <React.Fragment>
                                {
                                    isInPresetMode
                                        ?
                                        <div
                                            className="dropdown-scroll-view"
                                            style={{
                                                maxHeight: Math.max(50, contentViewableMaxHeight
                                                    - (this.dropdownBottomArea ? this.dropdownBottomArea.getBoundingClientRect().height : 0)
                                                ) + 'px',
                                            }}
                                        >
                                            <div className="dropdown-scroll-container">
                                                <DateRangePresetPicker
                                                    defaultDateRange={[startDate, endDate]}
                                                    dateRange={this.syncNeeded('preset') ? [startDate, endDate] : undefined}
                                                    onChange={([newStartDate, newEndDate]) => {
                                                        this.sync(newStartDate, newEndDate, 'preset');
                                                    }}
                                                    apply={() => {
                                                        this.pushChange();
                                                        this.hidePicker();
                                                    }}
                                                    getDateRangeError={this.checkDateRangeError}
                                                    frequentlyUsedPresetKeys={getFrequentlyUsedPresetKeys()}
                                                />
                                            </div>
                                        </div>
                                        :
                                        <DateRangePicker
                                            defaultDateRange={[startDate, endDate]}
                                            dateRange={this.syncNeeded('picker') ? [startDate, endDate] : undefined}
                                            onChange={([startDate, endDate]) => {
                                                this.sync(startDate, endDate, 'picker');
                                            }}
                                            getStartDateError={this.checkStartDateError}
                                            getEndDateError={this.checkEndDateError}
                                        />
                                }

                                <div
                                    className="bottom-area"
                                    ref={el => {
                                        this.dropdownBottomArea = el;

                                        requestAnimationFrame(() => {
                                            refreshDropdownDisplay();
                                        });
                                    }}
                                >
                                    <div className="result-bar">
                                        {
                                            error
                                                ?
                                                <div className="error">
                                                    <Icon name="caution-circle"/>
                                                    <span className="text">{error}</span>
                                                </div>
                                                :
                                                <div className="success">
                                                    <Icon name="tick"/>
                                                    <span className="text">{this.getResultText()}</span>
                                                </div>
                                        }
                                    </div>

                                    <div className="action-bar">
                                        <div className="button-group">
                                            <button
                                                type="button"
                                                className="cancel-button"
                                                onClick={() => {
                                                    this.discardChangeAndHidePicker();
                                                }}
                                            >
                                                {translate('Cancel')}
                                            </button>
                                        </div>
                                        <div className="button-group">
                                                <button
                                                    type="button"
                                                    className="preset-button"
                                                    onClick={
                                                        () => isInPresetMode
                                                            ? this.switchToCustom(() => {
                                                                refreshDropdownDisplay();

                                                                requestAnimationFrame(refreshDropdownDisplay);
                                                            })
                                                            : this.switchToPreset(() => {
                                                                refreshDropdownDisplay();

                                                                requestAnimationFrame(refreshDropdownDisplay);
                                                            })
                                                    }
                                                >
                                                    {
                                                        isInPresetMode
                                                            ? translate('Switch to custom')
                                                            : translate('Switch to preset')
                                                    }
                                                </button>
                                            <button
                                                type="button"
                                                className="submit-button"
                                                disabled={error !== null}
                                                onClick={() => {
                                                    if (error === null) {
                                                        this.pushChange();
                                                        this.hidePicker();
                                                    }
                                                }}
                                            >
                                                {translate('Apply')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                    }
                </Dropdown>
            }
        </div>;
    }
}

DateRangeSelector.defaultProps = {
    defaultValue: [[null, null, null], [null, null, null]],
    dropdownHorizontalAlignment: 'left',
    onChange: ([startDate, endDate]) => console.log('(DateRangeSelector) onChange is omitted', [startDate, endDate]),
    getStartDateError: ([startDate, endDate]) => null,
    getEndDateError: ([startDate, endDate]) => null
};


const CACHEKEY_PRESET_MODE = 'components.DateRangeSelector.presetMode';
const CACHEKEY_PRESETS_USE_COUNT_LOG = 'components.DateRangeSelector.presetsUseCountLog';

/**
 *
 * @param {bool} presetMode
 */
function savePresetMode(presetMode) {
    setLocalItem(CACHEKEY_PRESET_MODE, presetMode);
}

/**
 *
 * @return {boolean}
 */
function getSavedPresetMode() {
    return getLocalItem(CACHEKEY_PRESET_MODE);
}

/**
 *
 * @param {string} presetKey
 */
function logUseCountForPreset(presetKey) {
    const log = getPresetsUseCountLog();

    if (!log.hasOwnProperty(presetKey)) {
        log[presetKey] = 0;
    }

    log[presetKey]++;

    setLocalItem(CACHEKEY_PRESETS_USE_COUNT_LOG, log);
}

/**
 *
 * @return {{}}
 */
function getPresetsUseCountLog() {
    return getLocalItem(CACHEKEY_PRESETS_USE_COUNT_LOG, {});
}

/**
 *
 * @return {string[]}
 */
function getFrequentlyUsedPresetKeys() {
    const log = getPresetsUseCountLog();

    const arr = [];

    for (let presetKey in log) {
        if (log.hasOwnProperty(presetKey)) {
            const useCount = log[presetKey];
            arr.push([presetKey, useCount]);
        }
    }

    arr.sort((a, b) => b[1] - a[1]);

    return arr.map(t => t[0]);
}
