import { PassSettings, PinSettings, UserSettings, DBEntry } from '../types';

// return a timestamp of the current time
export const getTimeString = (): string => {
  const time = new Date();

  // function to add preceeding zero
  const addZero = (input: string): string => {
    if (Number(input) <= 9) return '0' + input;
    return input;
  };

  // function to add two preceeding zeros
  const addZeros = (input: string): string => {
    if (Number(input) <= 9) return '00' + input;
    else if (Number(input) <= 99) return '0' + input;
    return input;
  };

  const year = time.getUTCFullYear().toString();
  const month = addZero((time.getUTCMonth() + 1).toString());
  const date = addZero(time.getUTCDate().toString());
  const hour = addZero(time.getUTCHours().toString());
  const minutes = addZero(time.getUTCMinutes().toString());
  const seconds = addZero(time.getUTCSeconds().toString());
  const millisecs = addZeros(time.getUTCMilliseconds().toString());

  return (
    year +
    '-' +
    month +
    '-' +
    date +
    '_' +
    hour +
    ':' +
    minutes +
    ':' +
    seconds +
    '.' +
    millisecs
  );
};

// convert time string to timestamp for filenames
// format: YYYY + MM + DD + '_' + HH + MM + SS + MS
export const getTimeStamp = (input: string): string => {
  const year = input.slice(0, 4);
  const month = input.slice(5, 7);
  const date = input.slice(8, 10);
  const hour = input.slice(11, 13);
  const min = input.slice(14, 16);
  const sec = input.slice(17, 19);
  const ms = input.slice(20);
  return year + month + date + '-' + hour + min + sec + ms;
};

export const err2String = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else {
    return 'An unknown error occurred';
  }
};

// custom function to stringify Settings object
export const stringifyLB = (inp: UserSettings): string => {
  return JSON.stringify(inp, (key, value) => {
    if (value instanceof Set) {
      return [...value];
    }
    return value;
  });
};

// custom function to parse Settings object
export const parseLB = (inp: string): UserSettings => {
  return JSON.parse(inp, (key, value) => {
    // deal with Set
    if (key === 'pass_specialSet') {
      return new Set<string>(value);
    }
    return value;
  });
};

// function to generate PassSettings from UserSettings
export const getPassFromUser = (inp: UserSettings): PassSettings => {
  const usrPassSettings = new PassSettings();
  // shallow copy relevant properties from globalObj.data.settings to userPassSettings
  for (const [key, val] of Object.entries(inp)) {
    if (Object.hasOwn(usrPassSettings, key)) {
      usrPassSettings[key] = val;
    }
  }
  return usrPassSettings;
};

// function to generate PinSettings from UserSettings
export const getPinFromUser = (inp: UserSettings): PinSettings => {
  const usrPinSettings = new PinSettings();
  // shallow copy relevant properties from globalObj.data.settings to userPassSettings
  usrPinSettings.pin_charNum = inp.pin_charNum;
  return usrPinSettings;
};

// sort function which sorts an array of strings or an array of objects based on property name which is a string
// implements mergeSort
// sort order: symbols (by utf-16 code) ---> digits ---> letters (case insensitive)
export const modUtf16SortIt = <T extends string | DBEntry>(inp: T[]): T[] => {
  // function to test if char is alphanumeric
  const isAlphaNum = (inp: string): boolean => {
    const charCode = inp.charCodeAt(0);
    // numbers
    if (charCode >= 48 && charCode <= 57) return true;
    // letters - uppercase
    else if (charCode >= 65 && charCode <= 90) return true;
    // letters - lowercase
    else if (charCode >= 97 && charCode <= 122) return true;
    return false;
  };

  // function that returns element with lower rank in sort order given array of two elements
  const compareFunc = (arg1: T, arg2: T): T => {
    let stringA: string;
    let stringB: string;

    // get strings
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      stringA = arg1;
      stringB = arg2;
    } else if (typeof arg1 !== 'string' && typeof arg2 !== 'string') {
      stringA = arg1.data_org!;
      stringB = arg2.data_org!;
    } else {
      // one element is a string while the other is an object; this situation will never happen
      return arg1;
    }

    // compare strings
    // step through characters
    let i = 0;
    while (stringA[i] !== undefined && stringB[i] !== undefined) {
      // if both characters are the same, proceed to next character
      if (stringA[i] === stringB[i]) {
        i++;
        continue;
      }

      // if one character is symbol, and other is not, return element w/symbol
      if (!isAlphaNum(stringA[i]) && isAlphaNum(stringB[i])) return arg1;
      if (isAlphaNum(stringA[i]) && !isAlphaNum(stringB[i])) return arg2;

      // both characters are symbols OR both characters are alphanumeric
      let charCodeA = stringA.charCodeAt(i);
      let charCodeB = stringB.charCodeAt(i);

      // for case insensitive comparison; modify character of lowercase characters to uppercase code
      if (charCodeA >= 97 && charCodeA <= 122) {
        charCodeA -= 32;
      }
      if (charCodeB >= 97 && charCodeB <= 122) {
        charCodeB -= 32;
      }
      // if characters are equivalent
      if (charCodeA === charCodeB) {
        i++;
        continue;
      }

      if (charCodeA < charCodeB) return arg1;
      return arg2;
    }

    // deal with situation where one character is undefined
    if (stringA[i] === undefined) return arg1;
    return arg2;
  };

  // used to combine two sorted arrays into one
  const mergeArrays = (arr1: T[], arr2: T[]): T[] => {
    let i = 0;
    let j = 0;
    const result: T[] = [];

    while (i < arr1.length && j < arr2.length) {
      const currLow = compareFunc(arr1[i], arr2[j]);
      result.push(currLow);
      if (currLow === arr1[i]) {
        i++;
      } else j++;
    }

    // deal with remainder of array which has not been fully processed
    if (i === arr1.length) {
      while (j < arr2.length) {
        result.push(arr2[j]);
        j++;
      }
    } else {
      while (i < arr1.length) {
        result.push(arr1[i]);
        i++;
      }
    }

    return result;
  };

  let interval = 2;
  const arrCopy: T[] = [...inp];

  // determine minimum size of interval to fully process array
  // minimum size is the smallest power of 2 which exceeds arrCopy size
  let power = 0;
  while (2 ** power < arrCopy.length) power++;

  while (interval <= 2 ** power) {
    // iterates over arrCopy, starting w/ intervals of two, and then doubling until interval >= arrCopy lenght
    for (let i = 0; i < arrCopy.length; i += interval) {
      let j = i;
      let k = j + interval / 2;
      let tempArr: T[] = [];

      // get arrays for comparison
      const arr1: T[] = [];
      const arr2: T[] = [];

      while (j < i + interval / 2 && j < arrCopy.length) {
        arr1.push(arrCopy[j]);
        j++;
      }

      while (k < i + interval && k < arrCopy.length) {
        arr2.push(arrCopy[k]);
        k++;
      }

      // sort arr1 and arr2 into new array, tempArr;
      tempArr = mergeArrays(arr1, arr2);

      // at this point, tempArr holds sorted interval; mutate array with sorted interval
      let l = 0;
      for (let m = i; m < i + tempArr.length; m++) {
        arrCopy[m] = tempArr[l];
        l++;
      }
    }
    // double interval
    interval *= 2;
  }
  return arrCopy;
};
