import { StyleSheet } from 'react-native';

export const inputBox = (scrH: number) => {
  return StyleSheet.create({
    inpBox: {
      height: 0.08 * scrH,
      width: 0.3 * scrH,
      marginTop: 0.01 * scrH,
      marginBottom: 0.01 * scrH,
      borderRadius: 0.02 * scrH,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
      paddingLeft: 0.025 * scrH,
      fontSize: 0.025 * scrH,
      borderColor: 'black',
      backgroundColor: 'white',
    },
  });
};
