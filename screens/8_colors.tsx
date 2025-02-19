import { StyleSheet, View, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { RoundButton } from '../elements/buttons';
import { setUsrSettings } from '../util/database';
import { useModContext } from '../context/global';
import { Props } from '../types';
import { TriangleColorPicker, fromHsv } from 'react-native-color-picker';

export default function ColorPicker({ userControl, widget }: Props) {
  // bring in global context first
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;
  const currSettings = globalObj.data.settings;
  const colorChanger = globalObj.setContext;
  const oldColor = useRef(globalObj.data.settings.color);
  const [color, setColor] = useState(oldColor.current);

  const dynamicSty = StyleSheet.create({
    pickContainer: {
      marginTop: 0.02 * scrH,
      marginBottom: 0.01 * scrH,
      borderRadius: 0.02 * scrH,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
    },
  });
  const staticSty = styles;

  // function to handle submit click
  const onClickHandler = async () => {
    // update database entry
    const newSettings = { ...currSettings, color: color };

    // save to database
    try {
      await setUsrSettings(newSettings, userControl!.get(), widget!);
      Alert.alert(`Success`, `User settings were successfully updated`);
    } catch (err) {
      Alert.alert(`There was a problem updating user settings: ${err}`);
    }
  };

  // changes color in real time
  useEffect(() => {
    colorChanger('color', color);
  }, [color]);

  return (
    <View style={styles.container}>
      <View style={[dynamicSty.pickContainer, staticSty.pickContainer]}>
        <TriangleColorPicker
          style={styles.colorPicker}
          hideControls={true}
          defaultColor={oldColor.current}
          onColorChange={(color) => setColor(fromHsv(color))}
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
  pickContainer: {
    flex: 1,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: 'black',
  },
  colorPicker: {
    height: '80%',
    width: '80%',
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
