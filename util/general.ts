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
