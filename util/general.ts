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
