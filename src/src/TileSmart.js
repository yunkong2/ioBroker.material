import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-flexbox-grid';
import Paper from '@material-ui/core/Paper';
import Theme from './theme';
import Types from './States/Types';

import SmartSwitch from './States/SmartSwitch';
import SmartDimmer from './States/SmartDimmer';
import SmartBlinds from './States/SmartBlinds';
import SmartGeneric from './States/SmartGeneric';
import SmartState from './States/SmartState';
import SmartWindowTilt from './States/SmartWindowTilt';
import SmartButton from './States/SmartButton';
import SmartThermometer from './States/SmartThermometer';
import SmartInfo from './States/SmartInfo';

class TileSmart extends Component {
    static propTypes = {
        id:          PropTypes.string.isRequired,
        objects:     PropTypes.object.isRequired,
        states:      PropTypes.object.isRequired,
        editMode:    PropTypes.bool.isRequired,
        enumName:    PropTypes.string,
        channelInfo: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.channelInfo = this.props.channelInfo;
        this.state = {
            state: false,
            isPointer: false,
            visible: true
        };
        this.handlers = {
            onMouseDown: null,
            onMouseUp: null,
            onClick: null
        };
    }

    getObjectName(channelName) {
        return SmartGeneric.getObjectName(this.props.objects, this.props.id, null, channelName, this.props.enumName);
    }

    onMouseDown(e) {
        if (this.handlers.onMouseDown && !this.props.editMode) {
            e.preventDefault();
            this.handlers.onMouseDown(e);
        }
    }

    onMouseUp(e) {
        if (this.handlers.onMouseUp && !this.props.editMode) this.handlers.onMouseUp(e);
    }

    onClick(e) {
        if (this.handlers.onClick && !this.props.editMode) this.handlers.onClick(e);
    }

    getTileStyle() {
        let style;
        if (this.props.editMode) {
            style = Object.assign({}, Theme.tile.tile, Theme.tile.tileOn, Theme.tile.editEnabled);
            Object.assign(style, Theme.tile.editEnabled);

        } else {
            style = Object.assign({}, Theme.tile.tile, this.state.state ? Theme.tile.tileOn : Theme.tile.tileOff);
        }
        return style;
    }

    setVisibility(isVisible) {
        if (this.state.visible !== isVisible) {
            this.setState({visible: isVisible});
            this.props.onVisibilityControl(this.props.id, isVisible);
        }
    }

    wrapContent(content) {
        let style = {cursor: this.state.isPointer ? 'pointer' : 'inherit'};
        if (!this.state.visible) {
            style.display = 'none';
        }

        return (
            <Paper style={Object.assign(this.getTileStyle(), style)}
                   onMouseDown={this.onMouseDown.bind(this)}
                   onTouchStart={this.onMouseDown.bind(this)}
                   onMouseUp={this.onMouseUp.bind(this)}
                   onTouchEnd={this.onMouseUp.bind(this)}
                   onClick={this.onClick.bind(this)}>
                <span style={{display: 'none'}}>{this.props.id}</span>
                {content}
            </Paper>
        );
    }

    registerHandler(eventName, handler) {
        if (!this.props.editMode) {
            this.handlers[eventName] = handler;
        }
    }

    createControl(control, channelInfo, tile) {
        let Component = control; // This will be used by rendering
        //              ↓
        return (<Component
            key={channelInfo.id}
            enumName={this.props.enumName}
            channelInfo={channelInfo}
            tile={tile}
            editMode={this.props.editMode}
            states={this.props.states}
            objects={this.props.objects}
            registerHandler={this.registerHandler.bind(this)}
            onSaveSettings={this.props.onSaveSettings}
            onCollectIds={this.props.onCollectIds}
            onControl={this.props.onControl}
        />);
    }

    render() {
        if (this.channelInfo.type === Types.light || this.channelInfo.type === Types.socket) {
            return this.wrapContent(this.createControl(SmartSwitch, this.channelInfo, this));
        } else if (this.channelInfo.type === Types.dimmer) {
            return this.wrapContent(this.createControl(SmartDimmer, this.channelInfo, this));
        } else if (this.channelInfo.type === Types.blind) {
            return this.wrapContent(this.createControl(SmartBlinds, this.channelInfo, this));
        } else if (this.channelInfo.type === Types.windowTilt) {
            return this.wrapContent(this.createControl(SmartWindowTilt, this.channelInfo, this));
        } else if (this.channelInfo.type === Types.button) {
            return this.wrapContent(this.createControl(SmartButton, this.channelInfo, this));
        } else if (this.channelInfo.type === Types.temperature) {
            return this.wrapContent(this.createControl(SmartThermometer, this.channelInfo, this));
        } else if (this.channelInfo.type === Types.info) {
            return this.wrapContent(this.createControl(SmartInfo, this.channelInfo, this));
        } else if (this.channelInfo.type === Types.window ||
            this.channelInfo.type === Types.fireAlarm ||
            this.channelInfo.type === Types.door ||
            this.channelInfo.type === Types.motion) {
            return this.wrapContent(this.createControl(SmartState, this.channelInfo, this));
        }else {
            let name = this.channelInfo.type;
            Object.keys(Types).forEach(e => {
                if (Types[e] === this.channelInfo.type) {
                    name = e;
                    return false;
                }
            });
            console.error(`${name} not implemented!`);
            return null;
        }
    }
}

export default TileSmart;

