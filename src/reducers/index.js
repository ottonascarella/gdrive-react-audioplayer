import { combineReducers } from 'redux';

const googlePicker = (googlePicker = {}, action) => {
    switch (action.type) {
      case 'DRIVE_SIGN_IN':
        return {...googlePicker, drive: true};
      case 'DRIVE_SIGN_OUT':
        return {...googlePicker, drive: false};
      case 'PICKER_LOADED':
        return {...googlePicker, picker: true};
      case 'CHANGE_FILES':
        return {...googlePicker, files: action.payload};
      default:
        return googlePicker;
    }
};

const currentFile = (currentFile = null, action) => {
    switch (action.type) {
      case 'CHANGE_CURRENT_FILE':
        return action.payload;
      default:
        return currentFile;
    }
};

const reducers = combineReducers({
  googlePicker,
  currentFile
});

export default reducers;
