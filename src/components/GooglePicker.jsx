/*global gapi, google: true*/
import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';

import './GooglePicker.css';

class GooglePicker extends Component {

  _authLoaded(clientId) {

    // Handle the initial sign-in state.

    gapi.client.init({
			clientId,
			scope: 'https://www.googleapis.com/auth/drive.readonly'
		})
		.then(() => {
			// Listen for sign-in state changes.
      this._updateSigninStatus.call(this, gapi.auth2.getAuthInstance().isSignedIn.get());
			gapi.auth2.getAuthInstance().isSignedIn.listen(this._updateSigninStatus.bind(this));
		});

  }
	constructor(props) {

    super(props);
    gapi.load('client:auth2', this._authLoaded.bind(this, props.clientId));
    gapi.load('picker', this._pickerLoaded.bind(this));

    this.state = {
      authToken: null,
      pickerLoaded: false,
      files: []
    };

	}

  _pickerLoaded() {
    const mimes = [
          'audio/mpeg3',
          'audio/x-mpeg-3',
          'audio/mp3',
          'audio/mpeg',
          'audio/mp4',
          'audio/mpg',
          'audio/mp4a-latm',
          'audio/ogg',
          'application/ogg',
          'audio/webm',
          'audio/wav',
          'audio/x-wav',
          'audio/wave',
          'audio/aiff',
          'audio/x-aiff',
          'audio/x-flv',
          'audio/x-flac',
          'application/x-flac',
          'audio/flac'
    ];
    const view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes(mimes.join());
    this.picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .addView(view);

    this.setState({pickerLoaded: true})

  }

  onSignInClick(e) {
    const target = e.target;
    gapi.auth2
        .getAuthInstance()
        .signIn()
        .then(() => setTimeout(() => target.disabled = false), 200);

    target.disabled = true;
  }

  onSignOutClick() {
    gapi.auth2.getAuthInstance().signOut();
  }

	_updateSigninStatus(isSignedIn) {
		if (isSignedIn) {
      const user = gapi.auth2.getAuthInstance().currentUser.get();
      const authResponse = user.getAuthResponse(true);

      this.setState({authToken: authResponse.access_token});

    } else {

      this.setState({ authToken: null, files: [] });

    }
	}

  openPicker() {
    const picker = this.picker
        .setOAuthToken(this.state.authToken)
        .setCallback(this.onPickerBack.bind(this))
        .build();

    picker.setVisible(true);
  }

  onPickerBack(data) {
    let docs = [];
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      docs = data[google.picker.Response.DOCUMENTS];
    }

    if (document.activeElement) {
      document.activeElement.blur();
    }

    if (docs.length) this.setState({files:docs});

}

  render() {

    const {authToken, pickerLoaded, files} = this.state;
    const {children} = this.props;

    return (
      <div>

        <Toolbar style={{'flex-direction': 'row-reverse'}}>
          <ToolbarGroup>
            {
              !!authToken && pickerLoaded
                && <RaisedButton primary label="choose files" onClick={this.openPicker.bind(this)} />
            }
            {
              !!authToken
                  ? <RaisedButton primary label="sign out" onClick={this.onSignOutClick} />
                  : <RaisedButton primary label="sign in" onClick={this.onSignInClick} />
            }
          </ToolbarGroup>
        </Toolbar>

        {
          !!authToken && pickerLoaded && children && React.cloneElement(children, {files})
        }

      </div>
    );
  }
}

export default GooglePicker;