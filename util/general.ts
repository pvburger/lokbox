import { PassSettings, PinSettings, UserSettings } from '../types';

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
