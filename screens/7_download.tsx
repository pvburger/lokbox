import { StyleSheet, View, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Image, Keyboard } from 'react-native';
import { RoundButton } from '../elements/buttons';
import { inputBox } from '../styles';
import { verifyUser, data2ZIP } from '../util/database';
import { useModContext } from '../context/global';
import { Props } from '../types';
import Spin from '../assets/spinner.gif';

export default function Download({
  changePage,
  userControl,
  widget,
  keeboard,
}: Props) {
  const [pass, setPass] = useState('');
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const getZIP = async (): Promise<void> => {
    try {
      // verify user
      await verifyUser(userControl!.get(), pass);

      // download encrypted zip
      await data2ZIP(userControl!.get(), pass, widget!);
      Alert.alert('Success', `Zipped CSV file copied to Downloads folder`);
      changePage!(3);
    } catch (err) {
      Alert.alert(
        'Error',
        `There was an error downloading zipped CSV file: ${err}`
      );
    } finally {
      setIsClicked(false);
      setIsLoading(false);
    }
  };

  // function to handle submit click
  const onClickHandler = () => {
    if (keeboard) {
      Keyboard.dismiss();
    }
    setIsClicked(true);
  };

  useEffect(() => {
    if (isClicked && !keeboard) {
      setIsLoading(true);
      try {
        (async () => await getZIP())();
      } catch (err) {
        throw err;
      }
    }
  }, [isClicked, keeboard]);

  if (isLoading) {
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
          placeholder='confirm password'
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
