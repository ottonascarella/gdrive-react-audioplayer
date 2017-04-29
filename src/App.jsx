import React, { Component } from 'react';

import GooglePicker from './components/GooglePicker.jsx';
import AudioList from './components/AudioList.jsx';
import AudioPlayer from './components/AudioPlayer.jsx';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class App extends Component {

  render() {

    return (
      <MuiThemeProvider>
        <div className="App">
          <GooglePicker clientId="516539068558-h5diukvsumicbstbbmnnjh255so1ps7e.apps.googleusercontent.com">
            <AudioList>
              <AudioPlayer />
            </AudioList>
          </GooglePicker>
        </div>
      </MuiThemeProvider>
    );
  }

}

export default App;
