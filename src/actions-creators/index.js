
const DRIVE_SIGN_IN = {type:'DRIVE_SIGN_IN'};
const DRIVE_SIGN_OUT = {type:'DRIVE_SIGN_OUT'};
const PICKER_LOADED = {type:'PICKER_LOADED'};

const changeFilesAction = (files) => ({type: 'CHANGE_FILES', payload: files });

const changeCurrentFileAction = (file) => ({type: 'CHANGE_CURRENT_FILE', payload: file });

export {
  DRIVE_SIGN_IN,
  DRIVE_SIGN_OUT,
  PICKER_LOADED,
  changeFilesAction,
  changeCurrentFileAction
};
