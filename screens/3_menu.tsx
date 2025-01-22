import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { RegButton } from '../elements/buttons';
// import Submit from '../elements/submit';

const Menu = ({ changePage }) => {
  return (
    <View style={styles.container}>
      <RegButton onPressFunc={() => changePage(4)} label={'check'} />
      <RegButton onPressFunc={() => changePage(5)} label={'add'} />
      <RegButton onPressFunc={() => changePage(6)} label={'remove'} />
      <RegButton onPressFunc={() => changePage(0)} label={'update'} />
      <RegButton onPressFunc={() => changePage(0)} label={'download'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // height: '100%',
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});

export default Menu;
