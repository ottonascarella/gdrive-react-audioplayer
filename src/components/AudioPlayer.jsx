/*global AV, gapi: true*/
import React, {Component} from 'react';
import getFile from '../helpers/getFile';

import './AudioPlayer.css';

class AudioPlayer extends Component {
    constructor(props) {

        super(props);

        this.state = {
            loading: false,
            disabled: true,
            playing: false,
            duration: 0,
            progress: 0
        };

    }

    _loadFile(file) {

        console.log(`load file called with ${file.name}`);

        const that = this;
        const url = file ? `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media` : '';
        const authResponse = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true);
        const headers = {
            'Authorization':`Bearer ${authResponse.access_token}`
        };

        let player = this.player;
        let req = this.req;

        req && req.abort && req.abort();
        player && player.stop && player.stop();

        player = this.player;
        req = this.req = getFile(headers, url);

        req.setRequestHeader('Cache-Control','max-age=3600, must-revalidate');
        req.responseType = 'arraybuffer';

        req.onreadystatechange = () => {
            if (req.readyState !== req.DONE) return;
            this.req = null;
            this.setState({disabled: false});
            if (req.status !== 200) return;
            player && player.stop && player.stop();
            player = that.player = AV.Player.fromBuffer(req.response);

            player.on('duration', (n) => {
                const time = `${n / 1000 / 60 | 0}:${n / 1000 % 60 | 0}`;
                this.setState({time, duration: n});
            });

            player.on('end', () => {
                this.props.callNextTrack();
            });

            player.on('progress', (e) => {
                this.setState({progress: e});
            });

            this.setState({playing: true, loading: false});
            player.play();
        };

        req.send();
        this.setState({disabled: true, playing: false, loading: true});
    }

    _onTogglePlay() {
        const player = this.player;
        if (!this.state.playing) {
            this.setState({playing: true});
            player && player.play && player.play();
        } else {
            this.setState({playing: false});
            player && player.pause && player.pause();
        }
    }

    onProgressClick(e) {
        const {target, clientX} = e;
        const box = target.getBoundingClientRect();
        const percent = (clientX - box.left) / box.width;
        const player = this.player;
        const timeTo = player.duration * percent | 0;

        if (player && (undefined !== player.seek))
            player.seek(timeTo);
    }

    componentWillMount(props) {
        this.propsChanged(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.propsChanged(nextProps);
    }

    propsChanged(props) {
        const {file} = props;
        this._loadFile(file);
    }

    render() {
        const {file} = this.props;
        const filename = file ? file.name : '';
        const {disabled, loading, playing, progress, duration} = this.state;

        if (!gapi || !gapi.auth2) return <div></div>;

        return (
            <div className="AudioPlayer">
                <span className="AudioPlayer__filename">
                    {loading ? `loading ${filename}...` : filename}
                </span>

                <div className="AudioPlayer__controls">

                    <button className="AudioPlayer__toggleplay"
                            disabled={disabled}
                            onClick={this._onTogglePlay.bind(this)}>
                        {playing ? 'pause' : 'play'}
                    </button>

                    {
                        loading
                        ? <progress className="AudioPlayer__progress" />
                        : <progress className="AudioPlayer__progress" value={progress} max={duration} onClick={this.onProgressClick.bind(this)} />
                    }

                </div>
            </div>
        );
    }

}

export default AudioPlayer;