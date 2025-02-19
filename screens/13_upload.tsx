import { StyleSheet, View, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Image, Keyboard } from 'react-native';
import { RoundButton } from '../elements/buttons';
import { inputBox } from '../styles';
import { getPaths2Upload, unZipCopy } from '../util/database';
import { useModContext } from '../context/global';
import { PathSettings, Props } from '../types';
import Spin from '../assets/spinner.gif';

export default function Upload({
  changePage,
  userControl,
  widget,
  keeboard,
  pickControl,
}: Props) {
  const [pass, setPass] = useState('');
  const [isClicked, setIsClicked] = useState(false);
  const [pathVars, setPathVars] = useState(new PathSettings());

  // bring in global context
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;

  const dynamicSty = StyleSheet.create({
    ...inputBox(scrH),
    spin: {
      height: 0.2 * scrH,
      width: 0.2 * scrH,
    },
  });
  const staticSty = styles;

  // function to handle submit click
  const onClickHandler = () => {
    if (keeboard) {
      Keyboard.dismiss();
    }
    setIsClicked(true);
  };

  useEffect(() => {
    pickControl!.set();
    // added for development
    // console.log(`pickControl: ${pickControl!.get()}`);
    (async () => {
      try {
        // setup timer
        // has a promise return type of <never> because promise can only reject with an error, not resolve a value
        const timer = new Promise<never>((res, rej) => {
          setTimeout(() => rej(new Error('Operation timed out')), 10000);
        });

        // if getPaths2Upload does not resolve in 10000 ms, timer will throw an error and user will be logged out
        // safety feature
        const paths = await Promise.race([timer, getPaths2Upload()]);
        setPathVars(paths);
        // added for development
        // console.log(
        //   `fileURI: ${paths.fileURI}\napplication (TEMP) path: ${paths.temp}`
        // );
        pickControl!.set();
      } catch (err) {
        Alert.alert(
          'Error',
          `There was a problem determining path variables: ${err}`
        );
        pickControl!.set();
        changePage!(0);
      }
    })();
  }, []);

  useEffect(() => {
    if (isClicked) {
      (async () => {
        try {
          await unZipCopy(pass, pathVars, userControl!.get(), widget!);
          Alert.alert('Success', `CSV unzipped to application TEMP directory`);
        } catch (err) {
          Alert.alert('Error', `There was an error unzipping CSV: ${err}`);
        } finally {
          changePage!(3);
        }
      })();
    }
  }, [isClicked]);

  if (Object.keys(pathVars).length === 0) {
    return null;
  } else if (isClicked) {
    return (
      <View style={styles.container}>
        <Image source={Spin} style={[dynamicSty.spin, staticSty.spin]}></Image>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <TextInput
          style={dynamicSty.inpBox}
          autoCapitalize='none'
          onChangeText={(inp) => setPass(inp)}
          onSubmitEditing={() => Keyboard.dismiss()}
          placeholder='zip password'
          secureTextEntry={true}
        />
      </View>
      <View style={styles.buttonContainer}>
        <RoundButton onPressFunc={() => onClickHandler()} label={'submit'} />
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
  spin: {
    resizeMode: 'contain',
    // added for development
    // borderColor: 'red',
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
