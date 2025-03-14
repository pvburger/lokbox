import { StyleSheet, View, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Image, Keyboard } from 'react-native';
import { RoundButton } from '../elements/buttons';
import { inputBox } from '../styles';
import { loginUser, getDataSalt, getUsrSettings } from '../util/database';
import { useModContext } from '../context/global';
import Spin from '../assets/spinner.gif';
import { Props } from '../types';
import { makeKey } from '../util/crypto';
import { SQLiteDB } from '../util/database';

export default function Login({
  changePage,
  userControl,
  setWidget,
  keeboard,
}: Props) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
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

  // function to check credentials
  const checkCreds = async (): Promise<void> => {
    try {
      // log user into database
      const userID = await loginUser(user, pass);

      // retrieve salt
      const salt = await getDataSalt(userID);

      // generate encryption key
      const myWidget = await makeKey(pass, salt);

      // update state variable
      userControl!.set(userID);
      setWidget!(myWidget);

      // get user settings from database
      const newSettings = await getUsrSettings(userID, myWidget);

      upd8UserSettings(newSettings);

      Alert.alert('Success', `${user} has successfully logged in.`);
      // if user is 'admin', redirect to admin page
      if (user.toLowerCase() === 'admin') {
        await SQLiteDB.disconnectDB();
        changePage!(20);
      } else {
        changePage!(3);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `There was a problem logging ${user} into the database: ${error}`
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
    // added for development
    // console.log(`user is: ${user}; pass is ${pass}`);
  };

  useEffect(() => {
    if (isClicked && !keeboard) {
      setIsLoading(true);
      try {
        (async () => await checkCreds())();
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
          onChangeText={(inp) => setPass(inp)}
          onSubmitEditing={() => Keyboard.dismiss()}
          placeholder='password'
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
