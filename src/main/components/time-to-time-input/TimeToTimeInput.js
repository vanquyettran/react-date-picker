import './TimeToTimeInput.less';
import React from 'react';
import TimeInput from '../time-input/TimeInput';
import {translate} from "../../i18n";
import {
    getAbsoluteSeconds,
    timesAreEqual,
    timeIsNull,
    timeIsNullTotally,
} from '../../utils/time-hms';

let autoIncId = 0;

export default class TimeToTimeInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            startTime: props.defaultValue[0],
            endTime: props.defaultValue[1],
            startKey: ++autoIncId,
            endKey: ++autoIncId,
        };
    }

    pushChanges = () => {
        const {onChange} = this.props;
        const {startTime, endTime} = this.state;
        onChange([startTime, endTime]);
    };

    setValues = (values) => {
        this.setState(values, () => this.pushChanges());
    };

    setStartTime = ([hours, minutes, seconds]) => {
        if (timesAreEqual([hours, minutes, seconds], this.state.startTime, this.state.hasSeconds)) {
            return;
        }
        if (timeIsNullTotally([hours, minutes, seconds], this.props.hasSeconds)) {
            this.setValues({startTime: [null, null, null]});
            return;
        }
        if (this.props.areInSameDay &&
            !timeIsNull(this.state.endTime, this.props.hasSeconds) &&
            getAbsoluteSeconds([hours, minutes, seconds], this.props.hasSeconds) > getAbsoluteSeconds(this.state.endTime, this.props.hasSeconds)
        ) {
            this.setValues({
                startTime: this.state.endTime,
                startKey: ++autoIncId
            });
            return;
        }
        this.setValues({startTime: [hours, minutes, seconds]});
    };

    setEndTime = ([hours, minutes, seconds]) => {
        if (timesAreEqual([hours, minutes, seconds], this.state.endTime, this.state.hasSeconds)) {
            return;
        }
        if (timeIsNullTotally([hours, minutes, seconds], this.props.hasSeconds)) {
            this.setValues({endTime: [null, null, null]});
            return;
        }
        if (this.props.areInSameDay &&
            !timeIsNull(this.state.startTime, this.props.hasSeconds) &&
            getAbsoluteSeconds([hours, minutes, seconds], this.props.hasSeconds) < getAbsoluteSeconds(this.state.startTime, this.props.hasSeconds)
        ) {
            this.setValues({
                endTime: this.state.startTime,
                endKey: ++autoIncId
            });
            return;
        }
        this.setValues({endTime: [hours, minutes, seconds]});
    };

    render() {
        const {hasSeconds} = this.props;
        const {startTime, endTime, startKey, endKey} = this.state;

        return <div className="time-to-time-input">
            <TimeInput
                key={startKey}
                defaultValue={startTime}
                onChange={this.setStartTime}
                hasSeconds={hasSeconds}
            />
            <span>{translate('to')}</span>
            <TimeInput
                key={endKey}
                defaultValue={endTime}
                onChange={this.setEndTime}
                hasSeconds={hasSeconds}
            />
        </div>;
    }
}

TimeToTimeInput.defaultProps = {
    defaultValue: [[null, null, null], [null, null, null]],
    hasSeconds: true,
    areInSameDay: false
};
