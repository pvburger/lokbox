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
import { addUser, getDataSalt } from '../util/database';
import { useModContext } from '../context/global';
import Spin from '../assets/spinner.gif';
import React, { useState, useEffect } from 'react';
import { delay } from '../util/general';

export default function Register({
  changePage,
  userControl,
  setWidget,
  keeboard,
}) {
  const [user, setUser] = useState('');
  const [passA, setPassA] = useState('');
  const [passB, setPassB] = useState('');
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

  // function to register user
  const regUser = async (): Promise<void> => {
    try {
      const userRow = await addUser(user, passA, passB);
      const salt = await getDataSalt(userRow);
      userControl.set(userRow);
      setWidget(salt);
      // setIsLoading(false);
      Alert.alert('Success!', `${user} has successfully logged in.`);
      changePage(3);
    } catch (error) {
      // setIsLoading(false);
      Alert.alert(
        'Error',
        `There was an error adding ${user} to the database: ${error}`
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
      regUser();
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
          onChangeText={(inp) => setPassA(inp)}
          placeholder='password'
          secureTextEntry={true}
        />
        <TextInput
          style={dynamicSty.inpBox}
          onChangeText={(inp) => setPassB(inp)}
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
