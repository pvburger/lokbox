import * as SQLite from 'expo-sqlite';
import { Dirs, FileSystem } from 'react-native-file-access';
import { pick, types } from '@react-native-documents/picker';
import Papa from 'papaparse';
import { zipWithPassword, unzipWithPassword } from 'react-native-zip-archive';
import { modUtf16Sort } from './general';

import {
  getHashEntry,
  comparePass,
  generateSalt,
  nCrypt,
  dCrypt,
  makeKey,
} from './crypto';
import { getTimeString, getTimeStamp, stringifyLB, parseLB } from './general';
import {
  EntryForm,
  DBUser,
  DBEntry,
  DBEntryKey,
  DBEntryColObj,
  CSVEntry,
  UserSettings,
  PathSettings,
} from '../types';

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
          usr_salt TEXT NOT NULL, usr_settings TEXT NOT NULL, usr_created TEXT NOT NULL,
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
          `There was a problem loading the ${targetDB} database: ${err}`
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
      // still run a bcrypt; response for bad login/ password should be the same
      // if bCrypt parameters change, this hash will need to be updated to comply with new hash characteristics
      const fakeHash =
        '$2a$10$00000000000000000000000000000000000000000000000000000';
      await comparePass('bogus', fakeHash);

      throw 'Invalid username/password';
    }

    const compareResult = await comparePass(password, userRow.usr_password);
    if (!compareResult) {
      throw 'Invalid username/password';
    }

    // added for development
    // console.log(`usr_id: ${userRow.usr_id}`);

    return userRow.usr_id;
  } catch (error) {
    throw error;
  }
};

// verify user
export const verifyUser = async (
  usr_id: number,
  password: string
): Promise<void> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // retrieve hashed password
    // hashed password is returned on the usr_password key of the returned object
    const userRow: DBUser | null = await db.getFirstAsync(
      `SELECT * FROM ${table1} WHERE usr_id = ?`,
      [usr_id]
    );

    if (userRow === null) {
      // this will never be the case as the user is already logged in
      throw 'Invalid username/password';
    }

    const compareResult = await comparePass(password, userRow.usr_password);
    if (!compareResult) {
      throw 'Invalid username/password';
    }
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

export const getUsrSettings = async (
  userID: number,
  widget: string
): Promise<UserSettings> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // check if user exists
    const userRow: DBUser | null = await db.getFirstAsync(
      `SELECT * FROM ${table1} WHERE usr_id = ?`,
      [userID]
    );

    if (userRow === null) {
      throw new Error(
        'There was a problem retrieving user settings from database'
      );
    }

    // decrypt database entry
    const newSettings = await dCrypt(userRow.usr_settings, widget);

    // parse settings and return
    return parseLB(newSettings);
  } catch (error) {
    throw error;
  }
};

export const setUsrSettings = async (
  input: UserSettings,
  userID: number,
  widget: string
): Promise<void> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // check if user exists
    const userRow: DBUser | null = await db.getFirstAsync(
      `SELECT * FROM ${table1} WHERE usr_id = ?`,
      [userID]
    );

    if (userRow === null) {
      throw new Error(
        'There was a problem retrieving user settings from database'
      );
    }

    // stringify UserSettings object
    let secretSettings = stringifyLB(input);

    // encrypt settings data
    secretSettings = await nCrypt(secretSettings, widget);

    await db.runAsync(
      `UPDATE ${table1} SET usr_settings = ? WHERE usr_id = ?`,
      [secretSettings, userID]
    );
  } catch (error) {
    throw error;
  }
};

// add user
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

      // added for development - logs new user information
      // getHashInfo(hash);

      // create encryption key to encrypt 'usr_setting' entries
      const tempWidget = await makeKey(passwordA, salt);

      // get new settings object, stringify and encrypt
      const defSettings = new UserSettings();

      const mySettings = stringifyLB(defSettings);
      const mySecretSettings = await nCrypt(mySettings, tempWidget);

      // add entry to database
      await db.runAsync(
        `INSERT INTO ${table1} (usr_login, usr_password, usr_salt, usr_settings, usr_created) VALUES (?, ?, ?, ?, ?)`,
        [username, hash, salt, mySecretSettings, getTimeString()]
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
      // console.log(`usr_id: ${newRow.usr_id}`);

      return newRow.usr_id;
    }
  } catch (error) {
    throw error;
  }
};

// deletes database; developer option
export const nuke = async (): Promise<void> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // drop tables
    await db.runAsync(`DROP TABLE ${table1}`);
    // added for development
    // console.log(`${table1} table dropped!`);

    await db.runAsync(`DROP TABLE ${table2}`);
    // added for development
    // console.log(`${table2} table dropped!`);
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
    // added for development
    // console.log(`adding Data for usrID: ${id} for usr_org: ${dataEntry.org}`);

    // do some scrubbing first
    if (dataEntry.org === '') {
      throw new Error('"organization" cannot be empty');
    }
    if (
      dataEntry.passwordA !== dataEntry.passwordB ||
      dataEntry.pinA !== dataEntry.pinB
    ) {
      throw new Error('Security credentials do not match');
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
      if (entry.url !== '') newEntry.data_url = await nCrypt(entry.url, widget);
      if (entry.misc !== '')
        newEntry.data_misc = await nCrypt(entry.misc, widget);

      return newEntry;
    };

    const dbEntry = await parseEntry(dataEntry);

    // build arrays with properties and values
    const keys: string[] = [];
    const vals: (string | number)[] = [];
    const questions: string[] = [];

    for (const [key, val] of Object.entries(dbEntry)) {
      if (key !== 'data_id') {
        keys.push(key);
        vals.push(val);
        questions.push('?');
      }
    }

    // added for development
    // for (let i = 0; i < keys.length; i++) {
    //   console.log(`key: ${keys[i]}; value: ${vals[i]}`);
    // }

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

// add data entry
export const upD8Data = async (
  dataEntry: EntryForm,
  widget: string,
  oldEntry: DBEntry
): Promise<void> => {
  try {
    // do some scrubbing first
    if (dataEntry.org === '') {
      throw new Error('"organization" cannot be empty');
    }
    if (
      dataEntry.passwordA !== dataEntry.passwordB ||
      dataEntry.pinA !== dataEntry.pinB
    ) {
      throw new Error('Security credentials do not match');
    }

    // connect to database
    const db = await SQLiteDB.connectDB();

    // build query
    const parseEntry = async (entry: EntryForm): Promise<DBEntry> => {
      const time = getTimeString();
      const newEntry = new DBEntry();
      newEntry.usr_id = oldEntry.usr_id;

      newEntry.data_created = await nCrypt(oldEntry.data_created!, widget);
      newEntry.data_modified = await nCrypt(time, widget);
      newEntry.data_org = await nCrypt(dataEntry.org, widget);

      if (dataEntry.login !== '')
        newEntry.data_login = await nCrypt(dataEntry.login, widget);
      if (dataEntry.passwordA !== '')
        newEntry.data_password = await nCrypt(dataEntry.passwordA, widget);
      if (dataEntry.pinA !== '')
        newEntry.data_pin = await nCrypt(dataEntry.pinA, widget);
      if (dataEntry.email !== '')
        newEntry.data_email = await nCrypt(dataEntry.email, widget);
      if (dataEntry.url !== '')
        newEntry.data_url = await nCrypt(dataEntry.url, widget);
      if (dataEntry.misc !== '')
        newEntry.data_misc = await nCrypt(dataEntry.misc, widget);

      return newEntry;
    };

    const dbEntry = await parseEntry(dataEntry);

    // build arrays with properties and values
    const vals: (string | number)[] = [];
    const queArray: string[] = [];

    for (const [key, val] of Object.entries(dbEntry)) {
      if (key !== 'data_id') {
        vals.push(val);
        queArray.push(`${key} = ?`);
      }
    }

    // add data_id to vals array
    vals.push(oldEntry.data_id!);

    // build query
    const myQuery = `UPDATE ${table2} SET ${queArray.join(
      ', '
    )} WHERE data_id = ?`;

    // added for development
    // console.log(`myQuery: ${myQuery}`);
    // console.log(`vals: ${vals.join(', ')}`);

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
      `There was a problem creating unencrypted database entry: ${err}`
    );
  }
};

// creates unencrypted version of a value from the database
const dCryptSingle = async (input: string, widget: string): Promise<string> => {
  try {
    return await dCrypt(input, widget);
  } catch (err) {
    throw new Error(`There was a problem unencrypting database value: ${err}`);
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

    // sort data
    allRows = modUtf16Sort(allRows);

    return allRows;
  } catch (err) {
    throw `There was a problem retrieving data from database: ${err}`;
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
    throw `There was a problem error retrieving data from database: ${err}`;
  }
};

// returns the entire database entry given a data_org
export const getDBEntry = async (
  userID: number,
  widget: string,
  dataOrg: string
): Promise<DBEntry> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // get unencrypted array of DBEntryColObj for data_orgs
    const dataOrgArr = await getSingleData(userID, 'data_org', widget, false);

    // throw error if no data
    if (dataOrgArr.length === 0) {
      throw new Error('No data in database');
    }

    // determine data_id for given dataOrg
    let dataID = 0;
    for (let i = 0; i < dataOrgArr.length; i++) {
      if (dataOrgArr[i].data_val === dataOrg) {
        dataID = dataOrgArr[i].data_id;
        break;
      }
    }

    // throw error if no corresponding entry for dataOrg
    if (dataID === 0) {
      throw new Error(`No records found for ${dataOrg}`);
    }

    // added for development
    // console.log(`data_id: ${dataID}`);

    // retrieve DBEntry
    const dataEntry: DBEntry | null = await db.getFirstAsync(
      `SELECT * FROM ${table2} WHERE usr_id = ? AND data_id = ?`,
      [userID, dataID]
    );

    // should never actually be null...
    if (dataEntry === null) {
      throw new Error(`No records found for ${dataOrg}`);
    }

    // decrypt and return data entry
    return await dCryptObject(dataEntry, widget);
  } catch (err) {
    throw err;
  }
};

export const getAllDataAsString = async (
  id: number,
  widget: string,
  cipherT: boolean
): Promise<string> => {
  try {
    let allRows = await getAllData(id, widget, cipherT);

    // parse data into string
    const parse2String = (): string => {
      // string formatting function
      // splits string into length of 20 characters, adds new line and then 15 characters of white space
      const formString = (inp: string | null): string => {
        let result = '';
        let stringBuff = inp;
        // magicNum is the number of characters per line, from the database entry
        const magicNum = 20;

        if (stringBuff === null) {
          stringBuff = '<null>';
        }

        while (stringBuff.length >= magicNum) {
          if (stringBuff.length === magicNum) {
            result += stringBuff.slice(0, magicNum);
          } else {
            result += stringBuff.slice(0, magicNum) + '\n' + ' '.repeat(15);
          }
          stringBuff = stringBuff.slice(magicNum);
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
        result += `DATE MODIFIED: ${formString(entry.data_modified)}\n\n\n`;
      }

      return result;
    };

    return parse2String();
  } catch (err) {
    throw `There was a problem while parsing database data: ${err}`;
  }
};

// prints select information from database tables
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

    // logs table 1 (users table)
    console.log(`Table: ${table1}`);
    console.log(`------------------------------`);
    for (let user of table_users) {
      console.log(
        `usr_id: ${user.usr_id}, usr_login: ${user.usr_login}, usr_password: ${user.usr_password}, usr_email: ${user.usr_email}, usr_created: ${user.usr_created}`
      );
    }
    console.log('\n\n');

    // logs table 2 (data table)
    /*
    console.log(`Table: ${table2}`);
    console.log(`------------------------------`);
    for (let user of table_data) {
      console.log(
        `data_id: ${user.data_id}, usr_id: ${user.usr_id}, data_org: ${user.data_org}`
      );
    }
    console.log('\n\n');
    */
  } catch (err) {
    throw err;
  }
};

export const removeData = async (entryArr: DBEntryColObj[]): Promise<void> => {
  try {
    // added for development
    // for (let item of entryArr) {
    //   console.log(
    //     `Item to remove w/ data_id: ${item.data_id} and value: ${item.data_val}`
    //   );
    // }

    // connect to database
    const db = await SQLiteDB.connectDB();

    for (let entry of entryArr) {
      await db.runAsync(`DELETE FROM ${table2} WHERE data_id = ?`, [
        entry.data_id,
      ]);
    }
  } catch (err) {
    throw new Error(`There was a problem deleting database entries: ${err}`);
  }
};

// functionality to backup entire database (encrypted) on device
export const backup = async (): Promise<void> => {
  try {
    // path to database
    const dbFileUri = `${Dirs.DocumentDir}/SQLite/${targetDB}`;

    // create backup file name using current time
    const backupFileName = `${targetDB}_${getTimeStamp(
      getTimeString()
    )}.backup`;

    // check if db file exists; if not, throw error
    const dbExists = await FileSystem.exists(dbFileUri);
    if (!dbExists) {
      throw new Error('Database file does not exist');
    }

    // backup data
    await FileSystem.cpExternal(dbFileUri, backupFileName, 'downloads');

    // added for development
    // console.log(
    //   `Successfully backed up database; file location: ${backupFileName}`
    // );
  } catch (err) {
    throw err;
  }
};

// functionality to restore saved database to device
export const restore = async (): Promise<void> => {
  try {
    // helper to get file path
    const getFileURI = async (): Promise<string> => {
      try {
        // get path to backup file
        const resultObj = await pick();
        const uri = resultObj[0].uri;

        // added for development
        /*
        for (let i = 0; i < result.length; i++) {
          let itemProps = Object.entries(result[i]);
          for (let j = 0; j < itemProps.length; j++) {
            console.log(
              `result[${i}]: key = ${itemProps[j][0]}, val = ${itemProps[j][1]}`
            );
          }
          console.log('\n');
        }
        console.log(`result[0].uri: ${result[0].uri}`);
        */

        // get filename
        // according to react-native-file-access documentation, most method should work on (content://) Android resource uris
        const fName = (await FileSystem.stat(uri)).filename;

        // check filename to ensure valid backup file
        if (fName.length < 7 || fName.slice(-7).toLowerCase() !== '.backup') {
          throw new Error(
            `${fName} does not appear appear to be a valid backup file`
          );
        }

        return uri;
      } catch (err) {
        throw new Error(
          `There was a problem selecting the backup file: ${err}`
        );
      }
    };

    // helper timer
    // has a promise return type of <never> because promise can only reject with an error, not resolve a value
    const timer = new Promise<never>((res, rej) => {
      setTimeout(() => rej(new Error('Operation timed out')), 10000);
    });

    // race getFileURI and timer
    // this is a safety feature to prevent document picker from remaining open indefinitely
    const fileUri = await Promise.race([timer, getFileURI()]);

    // added for development
    // console.log(`fileUri: ${fileUri}`);

    // path to database
    const dbFileUri = `${Dirs.DocumentDir}/SQLite/${targetDB}`;
    // check there is an existing database
    let dbExists = await FileSystem.exists(dbFileUri);
    // if existing database, delete it
    if (dbExists) {
      // added for development
      // console.log('Deleting existing database');
      await FileSystem.unlink(dbFileUri);
      dbExists = await FileSystem.exists(dbFileUri);
      if (dbExists) {
        throw new Error(`Existing database was not deleted`);
      }
    }
    // restore backup file
    await FileSystem.cp(fileUri, dbFileUri);
    dbExists = await FileSystem.exists(dbFileUri);
    if (!dbExists) {
      throw new Error(`Selected database could not be restored`);
    }

    // connect to database
    const db = await SQLiteDB.connectDB();
    // delete admin account (applied from .backup file) so administrator can establish new account
    await db.runAsync(`DELETE FROM ${table1} WHERE usr_login = ?`, ['admin']);
  } catch (err) {
    throw err;
  }
};

// functionality to obtain paths of zip file
export const getPaths2Upload = async (): Promise<PathSettings> => {
  const newPaths = new PathSettings();
  try {
    const resultObj = await pick({ type: [types.zip] });
    // get path to backup file (percent encoded)
    newPaths.fileURI = resultObj[0].uri;

    // get filename
    // according to react-native-file-access documentation, most method should work on (content://) Android resource uris
    newPaths.fileName = (await FileSystem.stat(newPaths.fileURI)).filename;

    // app TEMP directory path
    newPaths.temp = `${Dirs.DocumentDir}/TEMP`;

    return newPaths;
  } catch (err) {
    throw err;
  }
};

// functionality to unzip file, copy to application directory, update database and cleanup
/*
TODO: Invoke FileSystem.readFile with stream rather than string. Currently, lokbox may crash given exceptionally large CSV files.
Currently, cannot pass File objects to parser; unclear whether working with File objects is feasible in React-Native.
*/
export const unZipCopy = async (
  pwd: string,
  input: PathSettings,
  userID: number,
  widget: string
): Promise<void> => {
  try {
    // check if TEMP path exists; if not, create it
    const pathExists = await FileSystem.exists(input.temp);

    if (!pathExists) {
      await FileSystem.mkdir(input.temp);
    }

    const zipURL = `${input.temp}/${input.fileName}`;

    // copy zip file to application TEMP directory
    await FileSystem.cp(input.fileURI, zipURL);

    // seperate try/catch block to throw legible error when password is incorrect
    try {
      await unzipWithPassword(zipURL, `${input.temp}`, pwd);
    } catch {
      throw new Error('Incorrect password');
    }

    // convert CSV to string
    const csvURL = zipURL.slice(0, -3) + 'csv';
    const csvAsString = await FileSystem.readFile(csvURL, 'utf8');

    // Parse Round 1
    // recon parse to ensure all data columns are included and accurate
    let ppResults = Papa.parse<CSVEntry>(csvAsString, {
      header: true,
      // error only used to handle FileReader errors; irrelevant in this case
      skipEmptyLines: true,
      preview: 1,
      complete: (results, file) => {
        // added for development
        // console.log('Parsing Round 1 complete');
      },
    });

    // check for data columns in results
    const dbEntryKeys = new Set(Object.keys(new DBEntry()));
    const csvCols = new Set(Object.keys(ppResults.data[0]));

    // remove irrelevant fields
    const unNeeded = ['data_id', 'usr_id', 'data_created', 'data_modified'];
    for (let item of unNeeded) {
      dbEntryKeys.delete(item);
    }

    // iterate through csvCols, make sure all are valid keys of DBEntry
    for (let property of csvCols) {
      if (
        !dbEntryKeys.has(property) &&
        property !== 'data_created' &&
        property !== 'data_modified'
      ) {
        throw new Error(`Invalid column header in CSV file: ${property}`);
      }
    }

    // iterate through dbEntryKeys, and make sure all exist in csvCols
    for (let property of dbEntryKeys) {
      if (!csvCols.has(property)) {
        throw new Error(`Missing data column in CSV file: ${property}`);
      }
    }

    // Parse Round 2
    // Actual parsing
    ppResults = Papa.parse<CSVEntry>(csvAsString, {
      header: true,
      // error only used to handle FileReader errors; irrelevant in this case
      skipEmptyLines: true,
      complete: (results, file) => {
        // added for development
        // console.log('Parsing Round 2 complete');
      },
    });

    // get list of existing orgs
    let currentOrgObjs = await getSingleData(userID, 'data_org', widget);
    const currentOrgSet = new Set(currentOrgObjs.map((org) => org.data_val));

    // iterate through previous results and ensure no conflicting entries and all data_orgs have a value
    for (let item of ppResults.data) {
      // data_org will never actually be null
      if (item.data_org === '' || item.data_org === null) {
        throw new Error(`Missing data_org`);
      } else if (currentOrgSet.has(item.data_org)) {
        throw new Error(`Invalid data_org: ${item.data_org}`);
      }
    }

    // create EntryForm array
    const entryFormArr = ppResults.data.map((item) => {
      const newEntry = new EntryForm();
      // item properties should never be null; Papa parse inserts empty strings rather than null values
      if (item.data_org !== null && item.data_org !== '')
        newEntry.org = item.data_org;
      if (item.data_login !== null && item.data_login !== '')
        newEntry.login = item.data_login;
      if (item.data_password !== null && item.data_password !== '')
        newEntry.passwordA = newEntry.passwordB = item.data_password!;
      if (item.data_pin !== null && item.data_pin !== '')
        newEntry.pinA = newEntry.pinB = item.data_pin!;
      if (item.data_email !== null && item.data_email !== '')
        newEntry.email = item.data_email!;
      if (item.data_url !== null && item.data_url !== '')
        newEntry.url = item.data_url!;
      if (item.data_misc !== null && item.data_misc !== '')
        newEntry.misc = item.data_misc!;
      return newEntry;
    });

    // upload data to database
    for (let item of entryFormArr) {
      await addData(item, userID, widget);
    }

    // delete temp files
    await FileSystem.unlink(zipURL);
    await FileSystem.unlink(csvURL);

    // added for development
    // console.log('Uploaded data to user account');
  } catch (err) {
    throw err;
  }
};

export const data2ZIP = async (
  id: number,
  password: string,
  widget: string
): Promise<void> => {
  try {
    // get data from database
    const dbArray = await getAllData(id, widget, false);
    if (dbArray.length === 0) {
      throw new Error('No data in database');
    }

    // create new array of object with data_id and usr_id removed
    const abridgedArr = dbArray.map((el): CSVEntry => {
      return {
        data_org: el.data_org,
        data_login: el.data_login,
        data_password: el.data_password,
        data_pin: el.data_pin,
        data_email: el.data_email,
        data_url: el.data_url,
        data_misc: el.data_misc,
        data_created: el.data_created,
        data_modified: el.data_modified,
      };
    });

    // generate csv string
    const csvString = Papa.unparse(abridgedArr);

    // get backup filename
    const fName = 'lokbox_' + getTimeStamp(getTimeString());
    // app TEMP directory path
    const tempPath = `${Dirs.DocumentDir}/TEMP`;
    const encType = 'AES-256';

    // added for development
    // console.log(`app directory: ${Dirs.DocumentDir}`);

    // check if TEMP path exists; if not, create it
    const pathExists = await FileSystem.exists(tempPath);

    if (!pathExists) {
      await FileSystem.mkdir(tempPath);
    }

    // write string to csv in application directory
    await FileSystem.writeFile(`${tempPath}/${fName}.csv`, csvString, 'utf8');

    // create zip file from csv
    // currently, there's a bug passing encryption type string to zipWithPassword in 'react-native-zip-archive'
    // library, hence the reliance on forked repo.
    // Repo owner has merged my pull request, but a new version has not yet been released.
    await zipWithPassword(
      [`${tempPath}/${fName}.csv`],
      `${tempPath}/${fName}.zip`,
      password,
      encType
    );

    // copy csv in application directory to shared Downloads directory
    await FileSystem.cpExternal(
      `${Dirs.DocumentDir}/TEMP/${fName}.zip`,
      `${fName}.zip`,
      'downloads'
    );

    // delete csv and zip in application directory
    await FileSystem.unlink(`${Dirs.DocumentDir}/TEMP/${fName}.csv`);
    await FileSystem.unlink(`${Dirs.DocumentDir}/TEMP/${fName}.zip`);
  } catch (err) {
    throw err;
  }
};

// functionality to remove users from database
export const removeUsers = async (users: string[]): Promise<void> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // remove users from database
    for (let usr of users) {
      await db.runAsync(`DELETE FROM ${table1} WHERE usr_login = ?`, [usr]);
      // added for development
      // console.log(`User ${usr} was removed...`);
    }
  } catch (err) {
    throw err;
  }
};

// functionality to get users from database
export const getUsers = async (): Promise<string[]> => {
  try {
    // connect to database
    const db = await SQLiteDB.connectDB();

    // retrieve data
    const allRows: { usr_login: string }[] | null = await db.getAllAsync(
      `SELECT usr_login FROM ${table1}`
    );

    // check for null (should never be null)
    if (allRows === null) {
      throw new Error(`User database is empty`);
    }

    // convert to normal string array
    const allUsers = allRows.map((el) => el.usr_login);

    return allUsers;
  } catch (err) {
    throw err;
  }
};
