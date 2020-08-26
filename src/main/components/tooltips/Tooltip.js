import './Tooltip.less';
import React from 'react';
import Icon from "../../components/icon/Icon";
import Dropdown from "../../components/dropdown/Dropdown";


export default class Tooltip extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            appendable: !props.delayedBeforeAppend
        };
    }

    componentDidMount() {
        if (!this.state.appendable) {
            this.appendTimer = setTimeout(() => {
                this.setState({appendable: true});
            }, 500);
        }
    }

    componentWillUnmount() {
        if (this.appendTimer) {
            clearTimeout(this.appendTimer);
        }
    }

    render() {
        const {children, opener, appearance, close, noPointer, noCloseButton} = this.props;
        const {appendable} = this.state;

        if (!appendable) {
            return null;
        }

        const padding = 6;
        const maxWidth = 300 + 2 * padding;

        return <Dropdown
            name="tooltip"
            opener={opener}
            close={close}
            isDropReversed={true}
            isPointerEnabled={!noPointer}
            horizontalAlignment="center"
            appearance={appearance}
        >
            {
                (contentViewableMaxHeight) =>
                    <div
                        className="tooltip"
                        style={{padding: `${padding}px 0`}}
                    >
                        <div
                            className="tooltip-inner"
                            style={{
                                padding: `0 ${padding}px`,
                                maxWidth: `${maxWidth}px`,
                                overflow: 'auto'
                            }}
                        >
                            <div
                                className="content"
                                style={{
                                    maxHeight: (contentViewableMaxHeight - 2 * padding) + 'px'
                                }}
                            >
                                {typeof children === 'string' ? <div dangerouslySetInnerHTML={{__html: children}}/> : children}
                            </div>
                        </div>
                        {
                            noCloseButton ||
                            <div className="close-button-wrapper">
                                <button
                                    type="button"
                                    className="close-button"
                                    onClick={close}
                                >
                                    <Icon name="times"/>
                                </button>
                            </div>
                        }
                    </div>
            }
        </Dropdown>;
    }
}


Tooltip.defaultProps = {
    opener: null,
    appearance: 'soft',
    close: () => {},
    noCloseButton: false,
    delayedBeforeAppend: false
};
