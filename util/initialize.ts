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
