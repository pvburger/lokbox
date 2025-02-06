import { StyleSheet, Text, View, Alert, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { RoundButton } from '../elements/buttons';
import { PinSettings } from '../types';
import { useModContext } from '../context/global';
import Slider from '@react-native-community/slider';
import { genPin } from '../util/crypto';
import { setUsrSettings } from '../util/database';
import { Props } from '../types';
import { getPinFromUser } from '../util/general';

export default function Pingen({ userControl, widget }: Props) {
  // bring in global context; pinSettings state variable is predicated on globalObj.data.settings
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;
  const bkgColor = globalObj.data.settings.color;
  const pinDigits = globalObj.data.settings.pin_charNum;
  const upd8Settings = globalObj.setAllContext;

  // generate pinSettings instance
  const usrPinSettings = getPinFromUser(globalObj.data.settings);

  const [pinSettings, setPinSettings] = useState(pinDigits);

  // wrapper to update user's settings
  const updateUserSettings = async () => {
    // create new setting object
    const newSettingsTemplate = { ...globalObj.data.settings };
    // overwrite pin_charNum
    newSettingsTemplate.pin_charNum = pinSettings;
    // update global settings with current state
    upd8Settings(newSettingsTemplate);

    try {
      // write global settings to database
      await setUsrSettings(newSettingsTemplate, userControl!.get(), widget!);
      Alert.alert(`Success`, `User settings were successfully updated`);
    } catch (err) {
      Alert.alert(`There was a problem updating user settings: ${err}`);
    }
  };

  // wrapper for genPin function to generate password
  const createPin = async (): Promise<void> => {
    // create instance of PinSettins and update relevant property
    const currPinSettings = new PinSettings();
    currPinSettings.pin_charNum = pinSettings;
    try {
      const pin = await genPin(currPinSettings);
      Alert.alert('Success', `Created a new pin: \n${pin}`);
    } catch (err) {
      Alert.alert('Error', `${err}`);
    }
  };

  // dynamic styleheet
  const dynamicSty = StyleSheet.create({
    settingsContainer: {
      marginTop: 0.02 * scrH,
      marginBottom: 0.01 * scrH,
      borderRadius: 0.02 * scrH,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
    },
    textHeader: {
      fontSize: 0.018 * scrH,
      marginTop: 0.02 * scrH,
      marginBottom: 0.01 * scrH,
    },
    subContainer: {
      marginHorizontal: 0.02 * scrH,
      marginVertical: 0.04 * scrH,
    },
    subText: {
      fontSize: 0.018 * scrH,
    },
    charNumView: {
      height: 0.04 * scrH,
      marginTop: 0.01 * scrH,
      marginBottom: 0.01 * scrH,
      alignItems: 'center',
      justifyContent: 'center',
      // added for development
      // borderColor: 'red',
      // borderWidth: 4,
    },
    charNumTxt: {
      fontSize: 0.025 * scrH,
    },
  });
  const staticSty = styles;

  // force rerender whenever pinSettings changes
  useEffect(() => {}, [pinSettings]);

  return (
    <View style={styles.container}>
      <View style={[dynamicSty.settingsContainer, staticSty.settingsContainer]}>
        <View style={styles.textHeaderContainer}>
          <Text style={[dynamicSty.textHeader, staticSty.textHeader]}>
            PIN SPECIFICATIONS
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={[dynamicSty.subContainer, staticSty.subContainer]}>
            <View style={styles.subTextContainer}>
              <Text style={[dynamicSty.subText]}>TOTAL DIGITS&gt;</Text>
            </View>
            <View style={[dynamicSty.charNumView]}>
              <Text style={[dynamicSty.charNumTxt]}>{pinSettings}</Text>
            </View>
            <Slider
              style={styles.charNumSlider}
              minimumValue={1}
              maximumValue={25}
              minimumTrackTintColor='black'
              thumbTintColor='black'
              step={1}
              value={pinSettings}
              onValueChange={(val) => setPinSettings(val)}
            ></Slider>
          </View>
        </ScrollView>
      </View>
      <View style={styles.buttonContainer}>
        <RoundButton onPressFunc={() => createPin()} label={'voil\u00E0'} />
        <RoundButton onPressFunc={() => updateUserSettings()} label={'save'} />
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
  settingsContainer: {
    flex: 1,
    width: '90%',
    backgroundColor: 'white',
    borderColor: 'black',
    alignItems: 'center',
  },
  textHeaderContainer: {
    width: '100%',
    alignItems: 'center',
    // added for development
    // borderColor: 'red',
    // borderWidth: 4,
  },
  textHeader: {
    color: '#808080',
    fontStyle: 'italic',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  subContainer: {
    width: '90%',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  charNumSlider: {
    width: '100%',
  },
  subTextContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});
