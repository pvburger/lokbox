/*
Inspiration for this implementation from:
https://stackoverflow.com/questions/17201450/salt-and-hash-password-in-nodejs-w-crypto
*/

/*
requests to the Node 'crypto' module are resolved to 'react-native-quick-crypto'
requests to the Node 'buffer' module are resolved to ''@craftzdog/react-native-buffer'
see index.ts for implementation and react-native-quick-crypto docs
*/

// import QuickCrypto from 'react-native-quick-crypto';
// const { randomBytes, pbkdf2, createCipheriv, createDecipheriv } = QuickCrypto;
import {
  randomBytes,
  randomInt,
  pbkdf2,
  createCipheriv,
  createDecipheriv,
} from 'crypto';
import { Buffer } from 'buffer';
import { PassSettings } from '../types';
import { hash, genSalt, compare, getRounds, getSalt } from 'bcryptjs';
import { getLettersArr, getDigitsArr, getSpecialsArr } from '../util/general';

// BCRYPT FUNCTIONALITY

// this is the bcrypt cost factor; the number of rounds is effectively 2^costFactor
const costFactor = 10;

// generates the salt required for bCrypt password hashing; asynchronous
const generateSaltBCrypt = async (): Promise<string> => {
  try {
    return await genSalt(costFactor);
  } catch (error) {
    throw `There was a problem generating the salt: ${error}`;
  }
};

export const getHashEntry = async (password: string): Promise<string> => {
  try {
    const salt = await generateSaltBCrypt();
    return await hash(password, salt);
  } catch (error) {
    throw `There was a problem creating the hash: ${error}`;
  }
};

// development tool which logs essential information in hashEntry
export const getHashInfo = (hashEntry: string): void => {
  // determine key pieces of information
  const pow = getRounds(hashEntry);

  // determine just the salt
  let naCl: string | string[] = getSalt(hashEntry).split('$');
  naCl = naCl[naCl.length - 1];

  // determine just the hash
  let hashCode: string | string[] = hashEntry.split('$');
  hashCode = hashCode[hashCode.length - 1].slice(naCl.length);

  console.log(`Full Hash: ${hashEntry}`);
  console.log(`Cost factor (2^x): ${pow}`);
  console.log(`Salt: ${naCl}`);
  console.log(`Hash: ${hashCode}`);
};

export const comparePass = async (
  password: string,
  hashEntry: string
): Promise<boolean> => {
  try {
    return await compare(password, hashEntry);
  } catch (error) {
    throw `There was a problem comparing input password to hashed password: ${error}`;
  }
};

// REACT-NATIVE-QUICK-CRYPTO FUNCTIONALITY

// constants for pbkdf2 password expansion and encryption and decryption
// developer would prefer to implement argon2id, but there are no currently viable implementations in Expo
const len_salt = 32;
const len_key = 32;
const len_iVector = 16;
const cycles = 100000;
const digest = 'sha256';
const encoding = 'base64';
const algo = 'aes256';
const inpEncoding = 'utf8';

// generates the salt required for password expansion with pbkdf2 algorithm; asynchronous
// returns as base64 encoded string
export const generateSalt = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    randomBytes(len_salt, (err, buff) => {
      if (err) {
        reject(new Error(`There was a problem generating the salt: ${err}`));
      } else {
        resolve(buff.toString(encoding));
      }
    });
  });
};

// generates the initialization vector required for encryption
// returns as base64 encoded string
export const generateIVector = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    randomBytes(len_iVector, (err, buff) => {
      if (err) {
        reject(
          new Error(
            `There was a problem generating the initialization vector: ${err}`
          )
        );
      } else {
        resolve(buff.toString(encoding));
      }
    });
  });
};

// generates pbkdf2 encryption key
export const makeKey = async (
  password: string,
  salt: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const saltBuff = Buffer.from(salt, encoding);
    const passBuff = Buffer.from(password, inpEncoding);
    pbkdf2(passBuff, saltBuff, cycles, len_key, digest, (err, derivedKey) => {
      if (err) {
        reject(
          new Error(
            `There was a problems generating the encryption key: ${err}`
          )
        );
      } else {
        resolve(derivedKey.toString(encoding));
      }
    });
  });
};

export const nCrypt = async (
  input: string,
  widget: string
): Promise<string> => {
  try {
    const iVec = await generateIVector();
    const iVecBuff = Buffer.from(iVec, encoding);
    const keyBuff = Buffer.from(widget, encoding);
    const cipher = createCipheriv(algo, keyBuff, iVecBuff);

    let secretBuff = cipher.update(input, inpEncoding);
    secretBuff = Buffer.concat([secretBuff, cipher.final()]);

    // return as base64 encoded string with iVec prepended separated by '$'
    // based on https://www.geeksforgeeks.org/node-js-crypto-createcipheriv-method/
    return `$${iVec}$${secretBuff.toString(encoding)}`;
    // encrypt message
  } catch (err) {
    throw new Error(`There was a problem during encryption: ${err}`);
  }
};

// TODO: REMOVE ASYNC
export const dCrypt = async (
  input: string,
  widget: string
): Promise<string> => {
  try {
    // parse database input
    const dbArray = input.split('$');
    const iVecBuff = Buffer.from(dbArray[1], encoding);
    // const secretBuff = Buffer.from(dbArray[2], encoding);

    // added during development
    // console.log(`iVec: ${dbArray[1]}`);
    // console.log(`secret: ${dbArray[2]}`);

    const keyBuff = Buffer.from(widget, encoding);
    const dCipher = createDecipheriv(algo, keyBuff, iVecBuff);

    let decoded = dCipher.update(dbArray[2], encoding, inpEncoding);
    decoded += dCipher.final(inpEncoding);

    return decoded;
  } catch (err) {
    throw new Error(`There was a problem during decryption: ${err}`);
  }
};

// generate a random password
export const genPass = async (inp: PassSettings): Promise<string> => {
  let charPool: string[] = [];
  let result = '';

  // helper function to generate random numbers
  const getRandInt = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      randomInt(0, charPool.length, (err, value) => {
        if (err) {
          reject(
            new Error(`There was a problem generating a random integer: ${err}`)
          );
        } else {
          resolve(value);
        }
      });
    });
  };
  if (inp.letters) {
    charPool = [...charPool, ...getLettersArr()];
  }
  if (inp.numbers) {
    charPool = [...charPool, ...getDigitsArr()];
  }
  if (inp.special) {
    charPool = [...charPool, ...inp.specialSet];
  }
  if (charPool.length === 0) {
    throw new Error(`No valid characters in character pool`);
  }

  try {
    for (let i = 0; i < inp.charNum; i++) {
      const randomNum = await getRandInt();
      result += charPool[randomNum];
    }
    return result;
  } catch (err) {
    throw `There was a problem generating a random password: ${err}`;
  }
};
