import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { RoundButton } from '../elements/buttons';
import { PassSettings } from '../types';
import { useModContext } from '../context/global';
import { getSpecialsArr } from '../util/general';
import Slider from '@react-native-community/slider';
import { genPass } from '../util/crypto';

export default function Passgen({ passCache }) {
  // lazy initialization of state to prevenent needles repetetive execution
  const [passSettings, setPassSettings] = useState(() => {
    return new PassSettings(getSpecialsArr());
  });

  // wrapper for setPassSettings
  const updateSettings = (
    prop: 'charNum' | 'numbers' | 'letters' | 'special' | 'specialSet',
    val: number | string | boolean | Set<string>
  ): void => {
    // values passed in on props other than 'specialSet' can be directly copied to state
    if (prop !== 'specialSet') {
      setPassSettings({ ...passSettings, [prop]: val });
      // for 'specialSet', we must add or remove the passed in value from the passSetting.specialSet
    } else if (typeof val === 'string') {
      const setCopy = new Set(passSettings.specialSet);
      if (setCopy.has(val)) {
        setCopy.delete(val);
      } else {
        setCopy.add(val);
      }
      setPassSettings({ ...passSettings, specialSet: setCopy });
    }
  };

  // wrapper for genPass function to generate password
  const createPassword = async (): Promise<void> => {
    try {
      const password = await genPass(passSettings);
      Alert.alert('Success', `Created a new password: \n${password}`);
    } catch (err) {
      Alert.alert('Error', `${err}`);
    }
  };

  // bring in global context
  const scrH = useModContext().screen_h;
  const bkgColor = useModContext().color;

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
    smButton: {
      height: 0.042 * scrH,
      width: 0.042 * scrH,
      margin: 0.01 * scrH,
      borderRadius: (0.042 * scrH) / 2,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
      alignItems: 'center',
      justifyContent: 'center',
    },
    smButtonTxt: {
      fontSize: 0.018 * scrH,
      fontWeight: 'bold',
    },
    specialContainer: {},
  });
  const staticSty = styles;

  // function to return color of small character buttons based on state
  const getColor = (
    inp: keyof Omit<PassSettings, 'charNum'>,
    char?: string
  ): string => {
    if (inp !== 'specialSet') {
      if (passSettings[inp]) {
        return bkgColor;
      } else {
        return 'white';
      }
    }
    if (typeof char === 'string' && passSettings.specialSet.has(char)) {
      return bkgColor;
    } else {
      return 'white';
    }
  };

  // function to generate special characters
  const genSpecial = (): JSX.Element[] => {
    const result: JSX.Element[] = [];
    const characters = getSpecialsArr();
    let counter = 1;
    for (let char of characters) {
      result.push(
        <View style={styles.smButtonBox}>
          <Pressable
            key={`sp-${counter++}`}
            style={[
              dynamicSty.smButton,
              staticSty.smButton,
              { backgroundColor: getColor('specialSet', char) },
            ]}
            onPress={() => updateSettings('specialSet', char)}
          >
            <Text style={[dynamicSty.smButtonTxt]}>{char}</Text>
          </Pressable>
        </View>
      );
    }
    return result;
  };

  // force rerender whenever passSettings changes
  useEffect(() => {}, [passSettings]);

  return (
    <View style={styles.container}>
      <View style={[dynamicSty.settingsContainer, staticSty.settingsContainer]}>
        <View style={styles.textHeaderContainer}>
          <Text style={[dynamicSty.textHeader, staticSty.textHeader]}>
            PASSWORD SPECIFICATIONS
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={[dynamicSty.subContainer, staticSty.subContainer]}>
            <View style={styles.subTextContainer}>
              <Text style={[dynamicSty.subText]}>TOTAL CHARACTERS&gt;</Text>
            </View>
            <View style={[dynamicSty.charNumView]}>
              <Text style={[dynamicSty.charNumTxt]}>
                {passSettings.charNum}
              </Text>
            </View>
            <Slider
              style={styles.charNumSlider}
              minimumValue={1}
              maximumValue={25}
              minimumTrackTintColor='black'
              thumbTintColor='black'
              step={1}
              value={13}
              onValueChange={(val) => updateSettings('charNum', val)}
            ></Slider>
          </View>

          <View style={[dynamicSty.subContainer, staticSty.subContainer]}>
            <View style={styles.subTextContainer}>
              <Text style={[dynamicSty.subText]}>
                INCLUDED CHARACTER SETS&gt;
              </Text>
            </View>
            <View style={styles.subTextContainer}>
              <Pressable
                style={[
                  dynamicSty.smButton,
                  { backgroundColor: getColor('numbers') },
                ]}
                onPress={() => updateSettings('numbers', !passSettings.numbers)}
              />
              <Text style={[dynamicSty.charNumTxt]}>numbers</Text>
            </View>
            <View style={styles.subTextContainer}>
              <Pressable
                style={[
                  dynamicSty.smButton,
                  { backgroundColor: getColor('letters') },
                ]}
                onPress={() => updateSettings('letters', !passSettings.letters)}
              />
              <Text style={[dynamicSty.charNumTxt]}>letters</Text>
            </View>
            <View style={styles.subTextContainer}>
              <Pressable
                style={[
                  dynamicSty.smButton,
                  { backgroundColor: getColor('special') },
                ]}
                onPress={() => updateSettings('special', !passSettings.special)}
              />
              <Text style={[dynamicSty.charNumTxt]}>special characters</Text>
            </View>
          </View>

          <View style={[dynamicSty.subContainer, staticSty.subContainer]}>
            <View style={styles.subTextContainer}>
              <Text style={[dynamicSty.subText]}>
                ALLOWABLE SPECIAL CHARACTERS&gt;
              </Text>
            </View>
            <View
              style={[dynamicSty.specialContainer, staticSty.specialContainer]}
            >
              {genSpecial()}
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={styles.buttonContainer}>
        <RoundButton
          onPressFunc={() => createPassword()}
          label={'voil\u00E0'}
        ></RoundButton>
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
    backgroundColor: 'white',
    width: '90%',
    borderColor: 'black',
    alignItems: 'center',
  },
  textHeaderContainer: {
    width: '100%',
    alignItems: 'center',
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
  smButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  smButtonBox: {
    // added for development
    // borderColor: 'red',
    // borderWidth: 4,
  },
  specialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '60%',
    alignItems: 'center',
    justifyContent: 'space-between',
    // added for development
    // borderColor: 'green',
    // borderWidth: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});
