import { StyleSheet, View, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { RoundButton } from '../elements/buttons';
import { inputBox } from '../styles';
import { setUsrSettings } from '../util/database';
import { useModContext } from '../context/global';
import { Props } from '../types';
import { stringifyLB } from '../util/general';

export default function ColorPicker({ userControl, widget }: Props) {
  const [color, setColor] = useState('#d3d3d3');

  // bring in global context
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;
  const bkgColor = globalObj.data.settings.color;
  const currSettings = globalObj.data.settings;
  // const upd8UserSettings = globalObj.setContext;

  // setColor('black');

  const dynamicSty = StyleSheet.create({
    ...inputBox(scrH),
    spin: {
      height: 0.2 * scrH,
      width: 0.2 * scrH,
    },
  });
  const staticSty = styles;

  // function to handle submit click
  const onClickHandler = async () => {
    Keyboard.dismiss();
    // update database entry
    const newSettings = { ...currSettings, color: color };
    // stringify newSettings
    const newSettingsString = stringifyLB(newSettings);
    // save to database
    try {
      await setUsrSettings(
        newSettingsString,
        userControl!.get(),
        widget!
      );
      Alert.alert(`Success`, `User settings were successfully updated`);
    } catch (err) {
      Alert.alert(`There was a problem updating user settings: ${err}`);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <TextInput
          style={dynamicSty.inpBox}
          autoCapitalize='none'
          onChangeText={(inp) => setColor(inp)}
          placeholder='color'
        />
      </View>
      <View style={styles.buttonContainer}>
        <RoundButton onPressFunc={() => onClickHandler()} label={'save'} />
      </View>
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
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});
