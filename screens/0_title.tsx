import { Pressable, StyleSheet, Text, View } from 'react-native';
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
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});
