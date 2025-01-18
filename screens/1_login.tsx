import { StyleSheet, View, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { RoundButton } from '../elements/buttons';
import { inputBox } from '../styles';
import { loginUser, getDataSalt } from '../util/database';
import { useModContext } from '../context/global';
import Spin from '../assets/spinner.gif';

export default function Login({ changePage, userControl, setWidget }) {
  // let username = '';
  // let password = '';
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
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

  /*
  //updater functions for username and password
  const updUser = (input: string): void => {
    username = input;
  };

  const updPass = (input: string): void => {
    password = input;
  };
  */

  // function to check credentials
  // handled by submit button
  const checkCreds = async (): Promise<void> => {
    // insert logic to check credentials
    try {
      setIsLoading(true);
      const userRow = await loginUser(user, pass);

      // retrieve salt and generate key
      const salt = await getDataSalt(userRow);

      userControl.set(userRow);
      setWidget(salt);
      setIsLoading(false);
      Alert.alert('Success!', `${user} has successfully logged in.`);
      changePage(3);
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Error',
        `There was a problem logging ${user} into the database: ${error}`
      );
    }
  };

  useEffect(() => {
    // rerender when the state of isLoading changes
  }, [isLoading]);

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
        <RoundButton onPressFunc={checkCreds} label={'submit'} />
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
