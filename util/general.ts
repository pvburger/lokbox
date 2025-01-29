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

// conver time string to timestamp for filenames
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

// add slight delay; used to allow keyboard listener in <App> sufficient time to update state before isLoading is updated
export const delay = async (milliS: number): Promise<void> => {
  return new Promise((res) => setTimeout(res, milliS));
};

export const getLettersArr = (): string[] => {
  const result: string[] = [];
  // get upper case letters
  for (let i = 65; i <= 90; i++) {
    result.push(String.fromCharCode(i));
  }
  // get lower case letters
  for (let j = 97; j <= 122; j++) {
    result.push(String.fromCharCode(j));
  }
  return result;
};

export const getDigitsArr = (): string[] => {
  const result: string[] = [];
  // get upper case letters
  for (let i = 48; i <= 57; i++) {
    result.push(String.fromCharCode(i));
  }
  return result;
};

export const getSpecialsArr = (): string[] => {
  const result: string[] = [];
  // get all printable (non-white space) special characters
  for (let i = 33; i <= 47; i++) {
    result.push(String.fromCharCode(i));
  }
  for (let j = 58; j <= 64; j++) {
    result.push(String.fromCharCode(j));
  }
  for (let k = 91; k <= 96; k++) {
    result.push(String.fromCharCode(k));
  }
  for (let l = 123; l <= 126; l++) {
    result.push(String.fromCharCode(l));
  }
  return result;
};
