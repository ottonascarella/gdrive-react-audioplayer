/*global AV, gapi: true*/
import React, {Component} from 'react';
import IconButton from 'material-ui/IconButton';
import LinearProgress from 'material-ui/LinearProgress';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import canPlayNative from '../helpers/canPlayNative';

import './AudioPlayer.css';

class AudioPlayer extends Component {
    constructor(props) {

        super(props);

        this.state = {
            loading: false,
            disabled: true,
            playing: false,
            volume: 100,
            duration: 0,
            progress: 0
        };

        this.onEnd = this._onEnd.bind(this);
        this.onLoadedMetaData = this._onLoadedMetaData.bind(this);
        this.onTimeUpdate = this._onTimeUpdate.bind(this);
        this.onPlay = this._onPlay.bind(this);
        this.onLoading = this._onLoading.bind(this);
        this.keyboard = this._keyboard.bind(this);

        document.body.addEventListener('keydown', this.keyboard);

    }
    get volume() {
        const p = this.player;
        if (!p) return 0;
        return (p.isNative) ? p.volume * 100 : p.volume;
    }
    set volume(x) {
        const p = this.player;
        if (!p) return 0;
        const max = (p.isNative) ? 1 : 100;
        const min = 0;
        let v = p.volume;

        if (p.isNative) v = x / 100;
        else v = x;

        if (v > max) v = max;
        else if (v < min) v = min;

        p.volume = v;

        return x;
    }
    volumeControl(cmd) {
        const player = this.player;
        if (!player) return;
        const max = 100;
        const min = 0;
        const current = this.volume;
        const step = 10;

        switch (cmd) {
            case 'up':
                if (current >= max - step) return;
                this.volume += step;
                break;
            case 'down':
                if (player.volume <= min - step) return;
                this.volume -= step;
                break;
            case 'toggle-mute':
                if (this.volume < 0.1) {
                    this.volume = max;
                } else {
                    this.volume = min;
                }
                break;
            default:
        }

        this.setState({volume: this.volume});
    }

    _keyboard({key}) {
        // console.log(key);
        switch(key) {
            case ' ':
                this._onTogglePlay.call(this);
                break;
            case 'ArrowUp':
                this.volumeControl('up');
                break;
            case 'ArrowDown':
                this.volumeControl('down');
                break;
            case 'm':
                this.volumeControl('toggle-mute');
                break;
            case 'ArrowRight':
            case 'ArrowLeft':
            default:
        }

    }

    playNative(file) {
        let player = this.player = new Audio();
        const url = this.getFileUrl(file);
        player.on = player.addEventListener;
        player.off = player.removeEventListener;

        player.seek = function(x) {
            this.currentTime = x;
        };


        player.isNative = true;

        console.log(`playing ${file.name} native`);

        player.on('loadedmetadata', this.onLoadedMetaData );
        player.on('ended', this.onEnd);
        player.on('timeupdate', this.onTimeUpdate);
        player.on('canplay', this.onPlay);

        player.src = url;
        player.play();
        this.onLoading();
    }

    getFileUrl(file) {
        const authResponse = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true);
        return file ? `https://www.googleapis.com/drive/v3/files/${file.id}?access_token=${authResponse.access_token}&alt=media` : '';
    }

    playAurora(file) {
        const that = this;
        const url = this.getFileUrl(file);

        let player = this.player;
        let req = this.req = new XMLHttpRequest();

        // player = that.player = AV.Player.fromURL(url);
        // player.on('duration', this.onLoadedMetaData);
        // player.on('end', this.onEnd);
        // player.on('progress', this.onTimeUpdate);
        // player.on('ready', this.onPlay);
        // player.play();

        console.log(`playing ${file.name} through Aurora.js`);

        req.onreadystatechange = () => {
            if (req.readyState !== req.DONE) return;
            this.req = null;
            if (req.status !== 200) return;
            player && player.stop && player.stop();
            player = that.player = AV.Player.fromBuffer(req.response);

            player.on('duration', this.onLoadedMetaData);
            player.on('end', this.onEnd);
            player.on('progress', this.onTimeUpdate);
            player.play();
            this._onPlay();
        };

        req.open('GET', url, true);
        req.responseType = 'arraybuffer';
        req.send();

        this.onLoading();

    }

    _onEnd(props) {
        this.props.callNextTrack();
    }

    _onLoading() {
        this.setState({disabled: true, playing: false, loading: true})
    }
    _onPlay() {
        console.log('playing.');
        this.setState({playing: true, loading: false, disabled: false});
    }

    _onTimeUpdate(e) {

        if (typeof(e) === 'number') {
            this.setState({progress: e});
            return;
        }

        this.setState({progress: e.target.currentTime});

    }

    _onLoadedMetaData(e) {
        let n;
        if (typeof(e) === 'number') n = e;
        else n = e.target.duration;
        const time = `${n / 1000 / 60 | 0}:${n / 1000 % 60 | 0}`;
        this.setState({time, duration: n});
    }

    loadFile(file) {

        file && file.name &&
            console.log(`loading file called with ${file.name}`);

        let player = this.player;
        let req = this.req;

        req && req.abort && req.abort();

        // pause player
        // deattach handlers to prevent memory leak
        if (player) {
            player.pause && player.pause();
            player.off('end', this.onEnd);
            player.off('ended', this.onEnd);
            player.off('loadedmetadata', this.onLoadedMetaData);
            player.off('timeupdate', this.onTimeUpdate);
            player.off('duration', this.onLoadedMetaData);
            player.off('progress', this.onTimeUpdate);
            player.off('ready', this.onPlay);
            player.off('canplay', this.onPlay);
        }

        if (!file) return;

        if (canPlayNative(file)) {
            this.playNative(file);
            return;
        }

        this.playAurora(file);
    }

    _onToggleMute() {
        this.volumeControl('toggle-mute');
    }
    _onTogglePlay() {
        const player = this.player;
        if (this.state.loading) return;
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

        if (!file) this.setState({
            loading: false,
            disabled: true,
            playing: false,
            duration: 0,
            progress: 0
        });

        if (this.player && this.player.pause) {
            this.player.pause();
            this.player = undefined;
        }

        this.loadFile(file);
    }

    render() {
        const {file} = this.props;
        const filename = file ? file.name : '';
        const {disabled, loading, playing, progress, duration, volume} = this.state;

        let volumeIcon = 'volume_up';

        if (volume > 66) volumeIcon = 'volume_up';
        else if (volume > 33) volumeIcon = 'volume_down';
        else if (volume > 0) volumeIcon = 'volume_mute';
        else volumeIcon = 'volume_off';

        if (!gapi || !gapi.auth2) return <div></div>;

        return (
            <div>

                <div>

                    <Toolbar>
                        <ToolbarGroup>

                        <IconButton
                                iconClassName="material-icons"
                                disabled={disabled}
                                onClick={this._onTogglePlay.bind(this)} >
                            {playing ? 'pause' : 'play_arrow'}
                        </IconButton>
                        <IconButton
                                iconClassName="material-icons"
                                disabled={disabled}
                                onClick={this._onToggleMute.bind(this)} >
                            {volumeIcon}
                        </IconButton>

                        <ToolbarTitle text={loading ? `loading ${filename}...` : filename} />

                        </ToolbarGroup>
                    </Toolbar>
                    <div className={loading ? 'AudioPlayer__progress AudioPlayer__progress--loading' : 'AudioPlayer__progress'} onClick={this.onProgressClick.bind(this)}>

                        <LinearProgress
                            mode={loading ? 'indeterminate' : 'determinate'}
                            value={loading ? 0 : progress}
                            min={0}
                            max={loading ? 100 : duration}
                            style={{height:'100%', pointerEvents:'none', borderRadius: 0}}
                            />
                    </div>
                </div>

            </div>
        );
    }

}

export default AudioPlayer;