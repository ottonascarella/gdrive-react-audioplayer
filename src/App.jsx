import React, { Component } from 'react';

import './App.css';

import GooglePicker from './components/GooglePicker.jsx';
import AudioList from './components/AudioList.jsx';
import AudioPlayer from './components/AudioPlayer.jsx';

class App extends Component {

  render() {

    return (
      <div className="App">
        <GooglePicker clientId="516539068558-h5diukvsumicbstbbmnnjh255so1ps7e.apps.googleusercontent.com">
          <AudioList>
            <AudioPlayer />
          </AudioList>
        </GooglePicker>
      </div>
    );
  }

}

export default App;
