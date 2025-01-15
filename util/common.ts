// functionality which may be called by various components
import { SQLiteDB } from '../util/database';

export const reSet = async (changePage, userControl, setWidget): Promise<void> => {
  try {
    userControl.set(0);
    changePage(0);
    setWidget('');

    // added for devlopment
    // console.log(`Running reSet; appState: ${appState}`);
    console.log('reSet invoked...');

    await SQLiteDB.disconnectDB();
  } catch (err) {
    throw err;
  }
};
