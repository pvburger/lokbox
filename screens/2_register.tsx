import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  Keyboard,
  Image,
} from 'react-native';
import { RoundButton } from '../elements/buttons';
import { inputBox } from '../styles';
import { addUser, getDataSalt, getUsrSettings } from '../util/database';
import { useModContext } from '../context/global';
import Spin from '../assets/spinner.gif';
import React, { useState, useEffect } from 'react';
import { Props } from '../types';
import { makeKey } from '../util/crypto';

export default function Register({
  changePage,
  userControl,
  setWidget,
  keeboard,
}: Props) {
  const [user, setUser] = useState('');
  const [passA, setPassA] = useState('');
  const [passB, setPassB] = useState('');
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // bring in global context
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;
  const upd8UserSettings = globalObj.setAllContext;

  const dynamicSty = StyleSheet.create({
    ...inputBox(scrH),
    spin: {
      height: 0.2 * scrH,
      width: 0.2 * scrH,
    },
  });
  const staticSty = styles;

  // function to register user
  const regUser = async (): Promise<void> => {
    try {
      // add user to database
      const userID = await addUser(user, passA, passB);

      // retrieve salt
      const salt = await getDataSalt(userID);

      // generate encryption key
      const myWidget = await makeKey(passA, salt);

      // update state variable
      userControl!.set(userID);
      setWidget!(myWidget);

      // get user settings from database
      const newSettings = await getUsrSettings(userID, myWidget);

      upd8UserSettings(newSettings);

      Alert.alert(
        'Success',
        `${user} account has been created.\nContinue to login.`
      );
      changePage!(0);
    } catch (error) {
      Alert.alert(
        'Error',
        `There was a problem adding ${user} to the database: ${error}`
      );
    } finally {
      setIsClicked(false);
      setIsLoading(false);
    }
  };

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
        (async () => await regUser())();
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
          onChangeText={(inp) => setUser(inp)}
          onSubmitEditing={() => Keyboard.dismiss()}
          placeholder='username'
        />
        <TextInput
          style={dynamicSty.inpBox}
          autoCapitalize='none'
          onChangeText={(inp) => setPassA(inp)}
          onSubmitEditing={() => Keyboard.dismiss()}
          placeholder='password'
          secureTextEntry={true}
        />
        <TextInput
          style={dynamicSty.inpBox}
          autoCapitalize='none'
          onChangeText={(inp) => setPassB(inp)}
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
