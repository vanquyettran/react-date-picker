import './TimeInput.less';
import React from 'react';
import TimePicker from '../../components/time-picker/TimePicker';
import TemplateInput from '../../components/template-input/TemplateInput';
import Dropdown from '../../components/dropdown/Dropdown';
import Icon from '../icon/Icon';
import timeHMSTemplate from "./timeHMSTemplate";
import timeHMTemplate from "./timeHMTemplate";

export default class TimeInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hours: props.defaultValue[0],
            minutes: props.defaultValue[1],
            seconds: props.defaultValue[2],
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

        if (state.hours === props.value[0] &&
            state.minutes === props.value[1] &&
            state.seconds === props.value[2]
        ) {
            return null;
        }

        state.hours = props.value[0];
        state.minutes = props.value[1];
        state.seconds = props.value[2];

        return state;
    }

    pushChange = () => {
        this.props.onChange([this.state.hours, this.state.minutes, this.state.seconds]);
    };

    sync = (hours, minutes, seconds, syncFrom) => {
        if (hours !== null || minutes !== null || seconds !== null) {
            if (hours === null || minutes === null || seconds === null) {
                if (hours === null) hours = 0;
                if (minutes === null) minutes = 0;
                if (seconds === null) seconds = 0;
                this.sync(hours, minutes, seconds, 'syncCentral');
                return;
            }
        }
        const {getTimeError} = this.props;
        const {hours: currentHours, minutes: currentMinutes, seconds: currentSeconds} = this.state;

        const currentTimeIsValid = getTimeError([currentHours, currentMinutes, currentSeconds]) === null;
        const newTimeIsValid = getTimeError([hours, minutes, seconds]) === null;

        // if current time is valid
        // and new time is invalid
        // then new time will be rejected
        // however if both are invalid
        // then new time is approved
        if (currentTimeIsValid && !newTimeIsValid) {
            this.sync(currentHours, currentMinutes, currentSeconds, 'syncCentral');
            return;
        }

        this.setState(
            {hours, minutes, seconds, syncFrom},
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
        const {hours, minutes, seconds, pickerShown} = this.state;

        if (pickerShown) {
            return;
        }

        this.setState(
            {pickerShown: true},
            () => this.sync(hours, minutes, seconds, 'pickerOpener')
        );
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

    render() {
        const {getTimeError, hasSeconds} = this.props;
        const {hours, minutes, seconds, pickerShown} = this.state;

        const isEmpty = hours === null && minutes === null && (seconds === null || !hasSeconds);

        return <div
            className={'time-input' + (pickerShown ? ' focused' : '') + (isEmpty ? ' is-empty' : '')}
            ref={el => this.el = el}
        >
            <TemplateInput
                template={hasSeconds ? timeHMSTemplate : timeHMTemplate}
                defaultValues={{hours, minutes, seconds}}
                values={this.syncNeeded('templateInput') ? {hours, minutes, seconds} : undefined}
                onChange={({hours, minutes, seconds}) => this.sync(hours, minutes, seconds, 'templateInput')}
                onFocus={(key) => this.showPicker()}
            />
            {
                !isEmpty
                    ?
                    <button
                        type="button"
                        className="clear-button"
                        onClick={() => this.clear()}
                    >
                        <Icon name="times"/>
                    </button>
                    :
                    <button
                        type="button"
                        className="clock-button"
                        onClick={() => this.showPicker()}
                    >
                        <Icon name="clock"/>
                    </button>
            }
            {
                pickerShown &&
                <Dropdown
                    name="time-picker"
                    opener={this.el}
                    close={this.hidePicker}
                >
                    <TimePicker
                        defaultValue={[hours, minutes, seconds]}
                        value={this.syncNeeded('picker') ? [hours, minutes, seconds] : undefined}
                        onChange={([hours, minutes, seconds]) => this.sync(hours, minutes, seconds, 'picker')}
                        getTimeError={([hours, minutes, seconds]) => getTimeError([hours, minutes, seconds])}
                        hasSeconds={hasSeconds}
                    />
                </Dropdown>
            }
        </div>;
    }
}


TimeInput.defaultProps = {
    defaultValue: [null, null, null],
    value: undefined,
    hasSeconds: true,
    getTimeError: ([hours, minutes, seconds]) => null,
    onChange: ([hours, minutes, seconds]) => console.log('(TimeInput) onChange is omitted', [hours, minutes, seconds])
};
