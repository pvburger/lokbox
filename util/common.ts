// functionality which may be called by various components
import { SQLiteDB } from '../util/database';

export const reSet = async (changePage): Promise<void> => {
  try {
    changePage(0);
    await SQLiteDB.disconnectDB();
    console.log('reSet invoked; disconnected from database');
  } catch (err) {
    throw err;
  }
};
