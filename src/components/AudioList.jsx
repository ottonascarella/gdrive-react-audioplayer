import React, {Component} from 'react';
import { dropWhile } from '../helpers/funk';
import {List, ListItem} from 'material-ui/List';

class AudioList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            file: null
        };

    }

    handleClick(file) {
        this.setState({file});
    }

    callNextTrack() {
        const {id} = this.state.file;
        const {files} = this.props;
        const tailFromCurrent = dropWhile(file => file.id !== id, files);
        let next;

        if (tailFromCurrent.length > 1) next = tailFromCurrent[1];
        else next = files[0];

        this.setState({file: next});

    }

    componentWillReceiveProps(nextProps) {
        this.setState({file: nextProps.files[0]});
    }

    render() {
        const {files, children} = this.props;
        const {file} = this.state;
        return (
            <div>
                { !!file && React.cloneElement(children, {file, callNextTrack: this.callNextTrack.bind(this)}) }
                <List>

                    {
                        files.map(f =>
                            <ListItem
                                primaryText={f.name}
                                key={f.id}
                                onClick={this.handleClick.bind(this, f)}
                            />
                        )
                    }
                </List>
            </div>
        );
    }
}

export default AudioList;