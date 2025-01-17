import { StyleSheet, View } from 'react-native';
import { RegButton } from '../elements/buttons';
import React from 'react';

export default function Title({ changePage }) {
  return (
    <View style={styles.container}>
      <RegButton onPressFunc={() => changePage(1)} label={'login'}></RegButton>
      <RegButton
        onPressFunc={() => changePage(2)}
        label={'register'}
      ></RegButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});
