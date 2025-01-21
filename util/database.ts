import * as SQLite from 'expo-sqlite';
// import * as FileSystemEx from 'expo-file-system';
import { Dirs, FileSystem } from 'react-native-file-access';
import { pickSingle } from 'react-native-document-picker';

import {
  getHashEntry,
  getHashInfo,
  comparePass,
  generateSalt,
  nCrypt,
  dCrypt,
} from './crypto';
import { getTimeString, getTimeStamp } from './general';
import {
  EntryForm,
  DBUser,
  DBEntry,
  DBEntryKey,
  DBEntryColObj,
} from '../types';

// ***** IS IT APPROPIATE TO HAVE THESE INITIALIZED HERE ? *****
const targetDB = 'testing';
const table1 = 'pass_users';
const table2 = 'pass_data';

export class SQLiteDB {
  private static db: SQLite.SQLiteDatabase | null = null;

  // get a singleton instance of the database
  static async connectDB(): Promise<SQLite.SQLiteDatabase> {
    if (!SQLiteDB.db) {
      try {
        SQLiteDB.db = await SQLite.openDatabaseAsync(targetDB);
        // added for development
        console.log(`${targetDB} database connection established`);

        // backticks for multi-line string
        // columns declared with INTEGER PRIMARY KEY will auto increment
        await SQLiteDB.db.execAsync(`
          PRAGMA journal_mode = WAL;
          
          PRAGMA foreign_keys = ON;
  
          CREATE TABLE IF NOT EXISTS ${table1} (usr_id INTEGER PRIMARY KEY NOT NULL, 
          usr_login TEXT NOT NULL COLLATE NOCASE, usr_password TEXT NOT NULL, usr_email TEXT, 
          usr_salt TEXT NOT NULL, usr_created TEXT NOT NULL,
          /* usr_logins must all be unique */
          UNIQUE(usr_login));
  
          CREATE TABLE IF NOT EXISTS ${table2} (data_id INTEGER PRIMARY KEY NOT NULL, 
          usr_id INTEGER NOT NULL, data_org TEXT NOT NULL COLLATE NOCASE, 
          data_login TEXT, data_password TEXT, data_pin TEXT, data_email TEXT, 
          data_url TEXT, data_misc TEXT, data_created TEXT NOT NULL, 
          data_modified TEXT NOT NULL, 
          /* establish usr_id as foreign key */
          /* ON DELETE and ON UPDATE modifiers propogate changes from parent to child */
          FOREIGN KEY(usr_id) REFERENCES ${table1}(usr_id) ON DELETE CASCADE ON UPDATE CASCADE,
          /* add unique constrain for usr_id and data_org, so every usr must have unique orgs */
          UNIQUE(usr_id, data_org));
  
          /* create an index for faster lookups */
          CREATE INDEX IF NOT EXISTS index_usr_id ON ${table2}(usr_id);
      `);

        // added for development
        console.log(`${targetDB} database connection configured`);
      } catch (err) {
        throw new Error(
          `There was an error loading the ${targetDB} database: ${err}`
        );
      }
    }
    return SQLiteDB.db;
  }

  // close singleton instance of the database
  static async disconnectDB(): Promise<void> {
    if (SQLiteDB.db) {
      try {
        await SQLiteDB.db.closeAsync();
        // added for development
        SQLiteDB.db = null;
        console.log(`${targetDB} database closed`);
      } catch (err) {
        throw new Error(
          `There was a problem closing the ${targetDB} database: ${err}`
        );
      }
    }
  }
}

// login user
/* known issues:
 */
export const loginUser = async (
  username: string,
  password: string
): Promise<number> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // check if user exists and retrieve hashed password
    // hashed password is returned on the usr_password key of the returned object
    const userRow: DBUser | null = await db.getFirstAsync(
      `SELECT * FROM ${table1} WHERE usr_login = ?`,
      [username]
    );

    if (userRow === null) {
      throw 'Invalid username/password';
    }

    const compareResult = await comparePass(password, userRow.usr_password);
    if (!compareResult) {
      throw 'Invalid username/password';
    }

    // added for development
    console.log(`usr_id: ${userRow.usr_id}`);

    return userRow.usr_id;
  } catch (error) {
    throw error;
  }
};

export const getDataSalt = async (userID: number): Promise<string> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // check if user exists and retrieve salt
    const userRow: DBUser | null = await db.getFirstAsync(
      `SELECT * FROM ${table1} WHERE usr_id = ?`,
      [userID]
    );

    if (userRow === null) {
      throw new Error('There was a problem retrieving salt from database');
    }

    return userRow.usr_salt;
  } catch (error) {
    throw error;
  }
};

// add user
/* known issues:
   1. requires comprehensive username password rules
   2. variables should be added to state as they are currently garbage collected after running function but still appear on screen
*/
export const addUser = async (
  username: string,
  passwordA: string,
  passwordB: string
): Promise<number> => {
  // insert logic to register user
  // check entries to ensure they comply with requirements
  try {
    if (
      username === '' ||
      passwordA === '' ||
      passwordB === '' ||
      passwordA !== passwordB
    ) {
      throw 'Invalid input';
    }

    // connect to database
    const db = await SQLiteDB.connectDB();

    // check if user exists
    const userRow: DBUser | null = await db.getFirstAsync(
      `SELECT * FROM ${table1} WHERE usr_login = ?`,
      [username]
    );

    if (userRow !== null) {
      throw 'Invalid username';
    } else {
      // generate hash entry for database
      const hash = await getHashEntry(passwordA);

      // generate users's salt for data encryption
      const salt = await generateSalt();

      // added for development
      getHashInfo(hash);
      // console.log('Current time (UTC): ' + getTimeString());

      // add entry to database
      await db.runAsync(
        `INSERT INTO ${table1} (usr_login, usr_password, usr_salt, usr_created) VALUES (?, ?, ?, ?)`,
        [username, hash, salt, getTimeString()]
      );

      // return usr_id
      const newRow: DBUser | null = await db.getFirstAsync(
        `SELECT * FROM ${table1} WHERE usr_login = ?`,
        [username]
      );

      if (newRow === null) {
        throw 'No such entry';
      }

      // added for development
      console.log(`usr_id: ${newRow.usr_id}`);
      // console.log(
      //   `User: ${username} added (hash: ${hash}, data salt: ${salt})`
      // );
      return newRow.usr_id;
    }
  } catch (error) {
    throw error;
  }
};

export const nuke = async (): Promise<void> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // drop tables
    await db.runAsync(`DROP TABLE ${table1}`);
    // added for development
    console.log(`${table1} table dropped!`);

    await db.runAsync(`DROP TABLE ${table2}`);
    // added for development
    console.log(`${table2} table dropped!`);
  } catch (error) {
    throw error;
  }
};

// add data entry
export const addData = async (
  dataEntry: EntryForm,
  id: number,
  widget: string
): Promise<void> => {
  try {
    console.log(`adding Data for usrID: ${id} for usr_org: ${dataEntry.org}`);

    // do some scrubbing first
    if (dataEntry.org === '') {
      throw `Input error, "organization" entry cannot be empty.`;
    }
    if (
      dataEntry.passwordA !== dataEntry.passwordB ||
      dataEntry.pinA !== dataEntry.pinB
    ) {
      throw 'Security credentials do not match.';
    }

    // connect to database
    const db = await SQLiteDB.connectDB();

    // get all data as plain text
    const orgObjArray = await getSingleData(id, 'data_org', widget);
    let orgArray = orgObjArray.map((el) => {
      return el.data_val;
    });

    // added for development
    // console.log(`orgArray: ${orgArray}`);

    // check if number because TS doesn't know this will always be a string array
    orgArray = orgArray.map((el) => {
      if (typeof el === 'string') {
        return el.toLowerCase();
      }
      return el;
    });

    if (orgArray.includes(dataEntry.org.toLowerCase())) {
      throw new Error(
        `Input error, ${dataEntry.org} entry already exists in database`
      );
    }

    // added for development
    // console.log('no conflicting entries');

    // build query
    const parseEntry = async (entry: EntryForm): Promise<DBEntry> => {
      const time = getTimeString();
      const newEntry = new DBEntry();
      newEntry.usr_id = id;

      // added for development
      // const secret = await nCrypt(entry.org, widget);
      // const exposed = await dCrypt(secret, widget);
      // console.log(`org encrypted: ${secret}`);
      // console.log(`${secret} decrypted: ${exposed}`);

      newEntry.data_created = await nCrypt(time, widget);
      newEntry.data_modified = await nCrypt(time, widget);
      newEntry.data_org = await nCrypt(entry.org, widget);

      if (entry.login !== '')
        newEntry.data_login = await nCrypt(entry.login, widget);
      if (entry.passwordA !== '')
        newEntry.data_password = await nCrypt(entry.passwordA, widget);
      if (entry.pinA !== '')
        newEntry.data_pin = await nCrypt(entry.pinA, widget);
      if (entry.email !== '')
        newEntry.data_email = await nCrypt(entry.email, widget);
      if (entry.url !== '')
        newEntry.data_url = await nCrypt(entry.email, widget);
      if (entry.misc !== '')
        newEntry.data_misc = await nCrypt(entry.misc, widget);

      return newEntry;
    };

    const entry = await parseEntry(dataEntry);

    // build arrays with properties and values
    const keys: string[] = [];
    const vals: (string | number)[] = [];
    const questions: string[] = [];

    for (const [key, val] of Object.entries(entry)) {
      keys.push(key);
      vals.push(val);
      questions.push('?');
    }

    // build query
    const myQuery = `INSERT INTO ${table2} (${keys.join(
      ', '
    )}) VALUES (${questions.join(', ')})`;

    // added for development
    // console.log(`myQuery: ${myQuery}`);

    await db.runAsync(myQuery, vals);
  } catch (err) {
    throw err;
  }
};

// creates unencrypted version of entire database entry
const dCryptObject = async (
  entry: DBEntry,
  widget: string
): Promise<DBEntry> => {
  try {
    const result = new DBEntry();

    // assign plaintext values
    result.data_id = entry.data_id;
    result.usr_id = entry.usr_id;

    // assign encrypted values after decrypting
    if (entry.data_org !== null) {
      result.data_org = await dCrypt(entry.data_org, widget);
    }
    if (entry.data_login !== null) {
      result.data_login = await dCrypt(entry.data_login, widget);
    }
    if (entry.data_password !== null) {
      result.data_password = await dCrypt(entry.data_password, widget);
    }
    if (entry.data_pin !== null) {
      result.data_pin = await dCrypt(entry.data_pin, widget);
    }
    if (entry.data_email !== null) {
      result.data_email = await dCrypt(entry.data_email, widget);
    }
    if (entry.data_url !== null) {
      result.data_url = await dCrypt(entry.data_url, widget);
    }
    if (entry.data_misc !== null) {
      result.data_misc = await dCrypt(entry.data_misc, widget);
    }
    if (entry.data_created !== null) {
      result.data_created = await dCrypt(entry.data_created, widget);
    }
    if (entry.data_modified !== null) {
      result.data_modified = await dCrypt(entry.data_modified, widget);
    }
    return result;
  } catch (err) {
    throw new Error(
      `There was an error creating unencrypted database entry: ${err}`
    );
  }
};

// creates unencrypted version of a value from the database
const dCryptSingle = async (input: string, widget: string): Promise<string> => {
  try {
    return await dCrypt(input, widget);
  } catch (err) {
    throw new Error(`There was an error unencrypting database value: ${err}`);
  }
};

export const getAllData = async (
  id: number,
  widget: string,
  secret: boolean
): Promise<DBEntry[]> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // retrieve data
    let allRows: DBEntry[] = await db.getAllAsync(
      `SELECT * FROM ${table2} WHERE usr_id = ?`,
      [id]
    );

    // functionality to decrypt data stored in allData
    if (!secret) {
      try {
        allRows = await Promise.all(
          allRows.map(async (entry): Promise<DBEntry> => {
            return await dCryptObject(entry, widget);
          })
        );
      } catch (err) {
        throw new Error(
          `There was a problem decrypting database entry array: ${err}`
        );
      }
    }

    return allRows;
  } catch (err) {
    throw `There was an error retrieving data from database: ${err}`;
  }
};

// returns a string array of objects for all the values in a single column from a users account
// each object contains a data_id and a data_val, the value associated with that key in the database entry
// defaults to returning in plaintext
export const getSingleData = async (
  id: number,
  dbKey: DBEntryKey,
  widget: string,
  secret: boolean = false
): Promise<DBEntryColObj[]> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // retrieve data
    const allRows: DBEntry[] = await db.getAllAsync(
      `SELECT * FROM ${table2} WHERE usr_id = ?`,
      [id]
    );

    const result: DBEntryColObj[] = [];

    // functionality to decrypt data stored in allData
    if (!secret && dbKey !== 'data_id' && dbKey !== 'usr_id') {
      // functionality to decrypt data then push to array
      for (let entry of allRows) {
        if (entry[dbKey] !== null && entry.data_id !== null) {
          result.push({
            data_id: entry.data_id,
            data_val: await dCryptSingle(entry[dbKey], widget),
          });
        }
      }
    } else {
      // functionality to push data diretly to array
      for (let entry of allRows) {
        if (entry[dbKey] !== null && entry.data_id !== null) {
          result.push({
            data_id: entry.data_id,
            data_val: entry[dbKey],
          });
        }
      }
    }

    return result;
  } catch (err) {
    throw `There was an error retrieving data from database: ${err}`;
  }
};

export const getAllDataAsString = async (
  id: number,
  widget: string
): Promise<string> => {
  try {
    // variable to determine whether to show cipher text or plain text
    const cipherT = false;

    let allRows = await getAllData(id, widget, cipherT);

    // parse data into string
    const parse2String = (): string => {
      // string formatting function
      // splits string into length of 25 characters, adds new line and then 15 characters of white space
      const formString = (inp: string | null): string => {
        let result = '';
        let stringBuff = inp;

        if (stringBuff === null) {
          stringBuff = '<null>';
        }

        while (stringBuff.length >= 25) {
          if (stringBuff.length === 25) {
            result += stringBuff.slice(0, 25);
          } else {
            result += stringBuff.slice(0, 25) + '\n' + ' '.repeat(15);
          }
          stringBuff = stringBuff.slice(25);
        }
        result += stringBuff + '\n';
        return result;
      };

      let result = '';

      // implement sorting functionality

      for (let entry of allRows) {
        // 'data_org', 'data_created', and 'data_modified' cannot have null values according to SQLite database rules
        result += `ORG:           ${formString(entry.data_org)}`;
        if (entry.data_login !== null) {
          result += `LOGIN:         ${formString(entry.data_login)}`;
        } else {
          result += `LOGIN:         <null>\n`;
        }
        if (entry.data_password !== null) {
          result += `PASSWORD:      ${formString(entry.data_password)}`;
        } else {
          result += `PASSWORD:      <null>\n`;
        }
        if (entry.data_pin !== null) {
          result += `PIN:           ${formString(entry.data_pin)}`;
        } else {
          result += `PIN:           <null>\n`;
        }
        if (entry.data_email !== null) {
          result += `EMAIL:         ${formString(entry.data_email)}`;
        } else {
          result += `EMAIL:         <null>\n`;
        }
        if (entry.data_url !== null) {
          result += `URL:           ${formString(entry.data_url)}`;
        } else {
          result += `URL:           <null>\n`;
        }
        if (entry.data_misc !== null) {
          result += `NOTES:         ${formString(entry.data_misc)}`;
        } else {
          result += `NOTES:         <null>\n`;
        }
        result += `DATE CREATED:  ${formString(entry.data_created)}`;
        result += `DATE MODIFIED: ${formString(entry.data_created)}\n\n\n`;
      }

      return result;
    };

    return parse2String();
  } catch (err) {
    throw `There was an error while parsing database data: ${err}`;
  }
};

export const printTables = async (): Promise<void> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    const table_users: DBUser[] = await db.getAllAsync(
      `SELECT * FROM ${table1}`
    );
    const table_data: DBEntry[] = await db.getAllAsync(
      `SELECT * FROM ${table2}`
    );

    console.log(`Table: ${table1}`);
    for (let user of table_users) {
      console.log(user);
    }

    console.log(`Table: ${table2}`);
    for (let user of table_data) {
      console.log(user);
    }
  } catch (err) {}
};

export const removeData = async (entryArr: DBEntryColObj[]): Promise<void> => {
  try {
    // added for development
    for (let item of entryArr) {
      console.log(
        `Item to remove w/ data_id: ${item.data_id} and value: ${item.data_val}`
      );
    }
    // connect to database
    const db = await SQLiteDB.connectDB();

    // get an object of users data entries
    // const table_users: DBUser[] = await db.getAllAsync(
    //   `SELECT * FROM ${table1}`
    // );

    for (let entry of entryArr) {
      await db.runAsync(`DELETE FROM ${table2} WHERE data_id = ?`, [
        entry.data_id,
      ]);
    }
  } catch (err) {
    throw new Error(`There was a problem deleting database entries: ${err}`);
  }
};

// functionality to backup entire database on device
export const backup = async (): Promise<void> => {
  try {
    const dbFileUri = `${Dirs.DocumentDir}/SQLite/${targetDB}`;

    const backupFileName = `${targetDB}_${getTimeStamp(
      getTimeString()
    )}.backup`;

    // check if db file exists; if not, throw error
    const dbExists = await FileSystem.exists(dbFileUri);
    if (!dbExists) {
      throw new Error('Database file does not exist');
    }

    await FileSystem.cpExternal(dbFileUri, backupFileName, 'downloads');

    console.log(
      `Successfully backed up database; file location: ${backupFileName}`
    );

    // copy database file
  } catch (err) {
    console.log(`There was a problem backing up the database: ${err}`);
  }
};

// functionality to restore saved database to device
export const restore = async (): Promise<void> => {
  try {
    const fileUri = (await pickSingle()).uri;

    // added for development
    // console.log(`file uri: ${fileUri}`);

    // check if there is currently a database; if so, delete it
    const dbFileUri = `${Dirs.DocumentDir}/SQLite/${targetDB}`;
    let dbExists = await FileSystem.exists(dbFileUri);
    if (dbExists) {
      console.log('Deleting existing database');
      await FileSystem.unlink(dbFileUri);
      dbExists = await FileSystem.exists(dbFileUri);
      if (dbExists) {
        throw new Error(`Existing database was not deleted`);
      } else {
        console.log('Existing database deleted');
      }
    } else {
      console.log('Nothing to delete');
    }

    // restore backup file
    await FileSystem.cp(fileUri, dbFileUri);
    dbExists = await FileSystem.exists(dbFileUri);
    if (dbExists) {
      console.log('Successfully restored database');
    } else {
      throw new Error(`Selected database could not be restored`);
    }
  } catch (err) {
    console.log(`There was a problem restoring the database: ${err}`);
  }
};
