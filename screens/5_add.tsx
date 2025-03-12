import { StyleSheet, View, TextInput, Alert, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { RoundButton } from '../elements/buttons';
import { inputBox } from '../styles';
import { addData } from '../util/database';
import { EntryForm, EntryFormKey, Props } from '../types';
import { useModContext } from '../context/global';
import { genPass, genPin } from '../util/crypto';
import { getPassFromUser, getPinFromUser } from '../util/general';

export default function AddInfo({ changePage, userControl, widget }: Props) {
  // sets the subsection of the form
  const [sub, setSub] = useState(0);
  const [userInfo, setUserInfo] = useState(new EntryForm());

  // bring in global context
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;
  const usrSettings = globalObj.data.settings;
  const dynamicSty = inputBox(scrH);

  // tool to update single property on userInfo
  const editEntry = (inp: string, kind: EntryFormKey): void => {
    setUserInfo({ ...userInfo, [kind]: inp });
  };

  // setter and getter for userInfo state representing data entries
  const getSetData = {
    get: () => {
      return userInfo;
    },
    set: (input: EntryForm) => {
      setUserInfo(input);
    },
  };

  // add user data to database
  const addEntry = async (): Promise<void> => {
    const userID = userControl!.get();
    try {
      // added for development
      // console.log(`userID: ${userID}`);
      // for (const [key, val] of Object.entries(userInfo)) {
      //   console.log(`key: ${key}, value: ${val}`);
      // }
      await addData(userInfo, userControl!.get(), widget!);
      Alert.alert('Success', `${userInfo.org} added to database`);
      changePage!(3);
    } catch (err) {
      Alert.alert(
        'Error',
        `There was a problem adding ${userInfo.org} into the database: ${err}`
      );
    }
  };

  const doMagic = async (): Promise<void> => {
    try {
      // for passwords
      if (sub === 1) {
        const passSettings = getPassFromUser(usrSettings);
        const pass = await genPass(passSettings);
        // update state
        const newUserInfo = { ...userInfo };
        newUserInfo.passwordA = pass;
        newUserInfo.passwordB = pass;
        setUserInfo(newUserInfo);
        Alert.alert('Success', `Successfully generated password:\n${pass}`);
        // for pins
      } else if (sub === 2) {
        const pinSettings = getPinFromUser(usrSettings);
        const pin = await genPin(pinSettings);
        // update state
        const newUserInfo = { ...userInfo };
        newUserInfo.pinA = pin;
        newUserInfo.pinB = pin;
        setUserInfo(newUserInfo);
        Alert.alert('Success', `Successfully generated pin:\n${pin}`);
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {sub === 0 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'org')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder='organization'
            value={userInfo.org}
          />
        )}
        {sub === 0 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'login')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder='username'
            value={userInfo.login}
          />
        )}
        {sub === 1 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'passwordA')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder='password'
            value={userInfo.passwordA}
            secureTextEntry={true}
          />
        )}
        {sub === 1 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'passwordB')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder='confirm password'
            value={userInfo.passwordB}
            secureTextEntry={true}
          />
        )}
        {sub === 2 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'pinA')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder='pin'
            value={userInfo.pinA}
            secureTextEntry={true}
          />
        )}
        {sub === 2 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'pinB')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder='confirm pin'
            value={userInfo.pinB}
            secureTextEntry={true}
          />
        )}
        {sub === 3 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'email')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder='email'
            value={userInfo.email}
          />
        )}
        {sub === 3 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'url')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder='url'
            value={userInfo.url}
          />
        )}
        {sub === 4 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'misc')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder='additional info'
            value={userInfo.misc}
          />
        )}
      </View>
      {sub === 0 && (
        <View style={styles.buttonContainer}>
          <RoundButton onPressFunc={() => setSub(1)} label={'next'} />
        </View>
      )}
      {sub >= 1 && sub <= 2 && (
        <View style={styles.buttonContainer}>
          <RoundButton onPressFunc={() => setSub(sub - 1)} label={'prev'} />
          <RoundButton onPressFunc={() => doMagic()} label={'!'} />
          <RoundButton onPressFunc={() => setSub(sub + 1)} label={'next'} />
        </View>
      )}
      {sub === 3 && (
        <View style={styles.buttonContainer}>
          <RoundButton onPressFunc={() => setSub(sub - 1)} label={'prev'} />
          <RoundButton onPressFunc={() => setSub(sub + 1)} label={'next'} />
        </View>
      )}
      {sub === 4 && (
        <View style={styles.buttonContainer}>
          <RoundButton onPressFunc={() => setSub(sub - 1)} label={'prev'} />
          <RoundButton onPressFunc={() => addEntry()} label={'submit'} />
        </View>
      )}
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
  inputContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // added for development
    // borderColor: 'red',
    // borderWidth: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});
