import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { RegButton, RoundButton } from '../elements/buttons';
import { Props } from '../types';

const Menu = ({ changePage }: Props) => {
  const [subPage, setSubPage] = useState(0);

  return (
    <View style={styles.container}>
      {subPage === 0 && (
        <RegButton onPressFunc={() => setSubPage(1)} label={'data'} />
      )}
      {subPage === 0 && (
        <RegButton onPressFunc={() => setSubPage(2)} label={'tools'} />
      )}
      {subPage === 1 && (
        <RegButton onPressFunc={() => changePage!(4)} label={'check'} />
      )}
      {subPage === 1 && (
        <RegButton onPressFunc={() => changePage!(5)} label={'add'} />
      )}
      {subPage === 1 && (
        <RegButton onPressFunc={() => changePage!(6)} label={'remove'} />
      )}
      {subPage === 1 && (
        <RegButton onPressFunc={() => changePage!(3)} label={'update'} />
      )}
      {subPage === 2 && (
        <RegButton onPressFunc={() => changePage!(9)} label={'passgen'} />
      )}
      {subPage === 2 && (
        <RegButton onPressFunc={() => changePage!(10)} label={'pingen'} />
      )}
      {subPage === 2 && (
        <RegButton onPressFunc={() => changePage!(7)} label={'backup'} />
      )}
      {subPage === 2 && (
        <RegButton onPressFunc={() => changePage!(7)} label={'restore'} />
      )}
      {subPage === 2 && (
        <RegButton onPressFunc={() => changePage!(11)} label={'color'} />
      )}
      {subPage >= 1 && (
        <View style={styles.buttonContainer}>
          <RoundButton onPressFunc={() => setSubPage(0)} label={'prev'} />
        </View>
      )}
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
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});

export default Menu;
