import './YearPicker.less';
import React from 'react';
import {MAX_YEAR, MIN_YEAR} from "../../view-constants/date-time/limitations";
import Icon from "../icon/Icon";
import {translate} from "../../i18n";

export default class YearPicker extends React.Component {
    constructor(props) {
        super(props);

        const pickedYear = props.defaultYear;

        this.state = {
            pickedYear,
            shownDecade: getDecadeOfYear(pickedYear),
            isPicked: pickedYear !== null
        };
    }
    static getDerivedStateFromProps(props, state) {
        if (props.year === undefined) {
            return null;
        }

        if (props.year === null) {
            state.isPicked = false;

            return state;
        }

        const pickedYear = props.year;

        state.pickedYear = pickedYear;
        state.shownDecade = getDecadeOfYear(pickedYear);
        state.isPicked = pickedYear !== null;

        return state;
    }


    showPrevDecade = () => {
        this.setState(prevState => ({
            shownDecade: prevState.shownDecade - 1
        }));
    };

    showNextDecade = () => {
        this.setState(prevState => ({
            shownDecade: prevState.shownDecade + 1
        }));
    };

    canShowPrevDecade = () => {
        const {shownDecade} = this.state;

        return shownDecade > 0;
    };

    canShowNextDecade = () => {
        const {shownDecade} = this.state;

        return shownDecade < 999;
    };

    pickYear = (year) => {
        const {onChange} = this.props;

        this.setState({
            pickedYear: year
        }, () => {
            onChange(this.state.pickedYear);
        });
    };

    checkYearError(year) {
        if (year < MIN_YEAR) {
            return translate('Only support from ::minYear onwards', {minYear: MIN_YEAR});
        }

        if (year > MAX_YEAR) {
            return translate('Only support from ::maxYear back', {maxYear: MAX_YEAR});
        }

        return this.props.getYearError(year);
    }


    render() {
        const {shownDecade, pickedYear, isPicked} = this.state;

        return <div className={'year-picker' + (isPicked ? ' is-picked' : '')}>
            <table>
                <tbody>
                <tr>
                    <td className="decade-backward-cell" onClick={() => this.canShowPrevDecade() && this.showPrevDecade()}>
                        {
                            this.canShowPrevDecade() &&
                            <Icon name="angle-left"/>
                        }
                    </td>
                    <td className="decade-cell" colSpan="4">
                        {`${shownDecade}X`}
                    </td>
                    <td className="decade-forward-cell" onClick={() => this.canShowNextDecade() && this.showNextDecade()}>
                        {
                            this.canShowNextDecade() &&
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
                                        const yearIndex = quarterIndex * 3 + index - 1;
                                        const isInShownDecade = yearIndex < 10 && yearIndex > -1;
                                        const year = shownDecade * 10 + yearIndex;
                                        const isPickedYear = year === pickedYear;
                                        const error = this.checkYearError(year);
                                        const now = new Date();
                                        const isCurrentYear = now.getFullYear() === year;

                                        return <td
                                            key={index}
                                            className={
                                                'year-cell'
                                                + (isInShownDecade ? ' is-in-shown-decade' : '')
                                                + (isPickedYear ? ' is-picked-year' : '')
                                                + (isCurrentYear ? ' is-current-year' : '')
                                                + (error === null ? ' is-valid' : '')
                                            }
                                            aria-label={error !== null ? error : undefined}
                                            colSpan="2"
                                            width="33.3333%"
                                            onClick={() => error === null && this.pickYear(year)}
                                        >
                                            {year}
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

YearPicker.defaultProps = {
    defaultYear: new Date().getFullYear(),
    year: undefined,
    getYearError: (year) => null,
    onChange: (year) => console.log('(YearPicker) onChange is omitted', year)
};

function getDecadeOfYear(year) {
    return Math.floor(year / 10);
}
