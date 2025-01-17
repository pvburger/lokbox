import { StyleSheet, View, TextInput, Alert } from 'react-native';
import React from 'react';
import { RoundButton } from '../elements/buttons';
import { inputBox } from '../styles';
import { loginUser, getDataSalt } from '../util/database';
import { useModContext } from '../context/global';

export default function Login({ changePage, userControl, setWidget }) {
  let username = '';
  let password = '';

  // bring in global context
  const scrH = useModContext().screen_h;
  const dynamicSty = inputBox(scrH);

  // updater functions for username and password
  const updUser = (input: string): void => {
    username = input;
  };

  const updPass = (input: string): void => {
    password = input;
  };

  // function to check credentials
  // handled by submit button
  const checkCreds = async (): Promise<void> => {
    // insert logic to check credentials
    try {
      const userRow = await loginUser(username, password);

      // retrieve salt and generate key
      const salt = await getDataSalt(userRow);

      userControl.set(userRow);
      setWidget(salt);
      Alert.alert('Success!', `${username} has successfully logged in.`);
      changePage(3);
    } catch (error) {
      Alert.alert(
        'Error',
        `There was a problem logging ${username} into the database: ${error}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <TextInput
          style={dynamicSty.inpBox}
          onChangeText={(inp) => updUser(inp)}
          placeholder='username'
        />
        <TextInput
          style={dynamicSty.inpBox}
          onChangeText={(inp) => updPass(inp)}
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
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});
