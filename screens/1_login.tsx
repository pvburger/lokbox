import { StyleSheet, View, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Image, Keyboard } from 'react-native';
import { RoundButton } from '../elements/buttons';
import { inputBox } from '../styles';
import { loginUser, getDataSalt } from '../util/database';
import { useModContext } from '../context/global';
import Spin from '../assets/spinner.gif';
import { delay } from '../util/general';

export default function Login({
  changePage,
  userControl,
  setWidget,
  keeboard,
}) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // bring in global context
  const scrH = useModContext().screen_h;
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
      // insert logic to check credentials
      const userRow = await loginUser(user, pass);

      // retrieve salt and generate key
      const salt = await getDataSalt(userRow);

      userControl.set(userRow);
      setWidget(salt);
      Alert.alert('Success!', `${user} has successfully logged in.`);
      changePage(3);
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

  // function to handle submit click
  const onClickHandler = () => {
    Keyboard.dismiss();
    setIsClicked(true);
  };

  useEffect(() => {
    if (isClicked && !keeboard) {
      setIsLoading(true);
      checkCreds();
    }
  }, [keeboard]);

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
          onChangeText={(inp) => setUser(inp)}
          placeholder='username'
        />
        <TextInput
          style={dynamicSty.inpBox}
          onChangeText={(inp) => setPass(inp)}
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
