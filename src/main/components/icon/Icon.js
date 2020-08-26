import './Icon.less';
import React from 'react';

export default class Icon extends React.Component {
    render() {
        const {name} = this.props;

        return <i className={`icon -_-_ -_-_${name}`}/>;
    }
}
