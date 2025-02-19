// functionality which may be called by various components
import { SQLiteDB } from '../util/database';
import { Props } from '../types';

// Notice how the 'type' of the changePage function can be extracted from Props...
export const reSet = async (changePage: Props['changePage']): Promise<void> => {
  try {
    changePage!(0);
    await SQLiteDB.disconnectDB();
    console.log('reSet invoked; disconnected from database');
  } catch (err) {
    throw err;
  }
};
