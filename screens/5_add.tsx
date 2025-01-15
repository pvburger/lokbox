import { StyleSheet, View, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { RoundButton } from '../elements/buttons';
// import { EntryBox } from '../elements/input';
import { inputBox } from '../styles';
import { addData } from '../util/database';
import { EntryForm, EntryFormKey } from '../types';

export default function AddInfo({ changePage, userControl, widget }) {
  // sets the subsection of the form
  const [sub, setSub] = useState(0);
  const [userInfo, setUserInfo] = useState(new EntryForm());

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
    const userID = userControl.get();
    try {
      // added for development
      // console.log(`userID: ${userID}`);
      // for (const [key, val] of Object.entries(userInfo)) {
      //   console.log(`key: ${key}, value: ${val}`);
      // }
      await addData(userInfo, userControl.get(), widget);
      Alert.alert('Success!', `${userInfo.org} added to database`);
      changePage(3);
    } catch (err) {
      Alert.alert(
        'Error',
        `There was a problem adding ${userInfo.org} into the database: ${err}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {sub === 0 && (
          <TextInput
            style={inputBox.inputBox}
            onChangeText={(inp) => editEntry(inp, 'org')}
            placeholder='organization'
            value={userInfo.org}
          />
        )}
        {sub === 0 && (
          <TextInput
            style={inputBox.inputBox}
            onChangeText={(inp) => editEntry(inp, 'login')}
            placeholder='username'
            value={userInfo.login}
          />
        )}
        {sub === 1 && (
          <TextInput
            style={inputBox.inputBox}
            onChangeText={(inp) => editEntry(inp, 'passwordA')}
            placeholder='password'
            value={userInfo.passwordA}
            secureTextEntry={true}
          />
        )}
        {sub === 1 && (
          <TextInput
            style={inputBox.inputBox}
            onChangeText={(inp) => editEntry(inp, 'passwordB')}
            placeholder='confirm password'
            value={userInfo.passwordB}
            secureTextEntry={true}
          />
        )}
        {sub === 2 && (
          <TextInput
            style={inputBox.inputBox}
            onChangeText={(inp) => editEntry(inp, 'pinA')}
            placeholder='pin'
            value={userInfo.pinA}
            secureTextEntry={true}
          />
        )}
        {sub === 2 && (
          <TextInput
            style={inputBox.inputBox}
            onChangeText={(inp) => editEntry(inp, 'pinB')}
            placeholder='confirm pin'
            value={userInfo.pinB}
            secureTextEntry={true}
          />
        )}
        {sub === 3 && (
          <TextInput
            style={inputBox.inputBox}
            onChangeText={(inp) => editEntry(inp, 'email')}
            placeholder='email'
            value={userInfo.email}
          />
        )}
        {sub === 3 && (
          <TextInput
            style={inputBox.inputBox}
            onChangeText={(inp) => editEntry(inp, 'url')}
            placeholder='url'
            value={userInfo.url}
          />
        )}
        {sub === 4 && (
          <TextInput
            style={inputBox.inputBox}
            onChangeText={(inp) => editEntry(inp, 'misc')}
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
      {sub >= 1 && sub <= 3 && (
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
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  inputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
