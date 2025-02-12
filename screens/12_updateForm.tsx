import { StyleSheet, View, TextInput, Alert, Keyboard } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { RoundButton } from '../elements/buttons';
import { inputBox } from '../styles';
import { addData, upD8Data } from '../util/database';
import { EntryForm, EntryFormKey, DBEntry, Props, LookupTable } from '../types';
import { useModContext } from '../context/global';
import { genPass, genPin } from '../util/crypto';
import { getPassFromUser, getPinFromUser } from '../util/general';

export default function UpdateForm({
  changePage,
  userControl,
  widget,
  entryControl,
}: Props) {
  // functionality to convert data from DBEntry to EntryForm
  const makeEntry = (inp: DBEntry): EntryForm => {
    const newForm = new EntryForm();
    inp.data_org !== null
      ? (newForm.org = inp.data_org)
      : (newForm.org = inp.data_org = '');
    inp.data_login !== null
      ? (newForm.login = inp.data_login)
      : (newForm.login = '');
    inp.data_password !== null
      ? (newForm.passwordA = newForm.passwordB = inp.data_password)
      : (newForm.passwordA = newForm.passwordB = '');
    inp.data_email !== null
      ? (newForm.email = inp.data_email)
      : (newForm.email = '');
    inp.data_url !== null ? (newForm.url = inp.data_url) : (newForm.url = '');
    inp.data_pin !== null
      ? (newForm.pinA = newForm.pinB = inp.data_pin)
      : (newForm.pinA = newForm.pinB = '');
    inp.data_misc !== null ? (newForm.misc = inp.data_misc) : newForm.misc;
    return newForm;
  };

  // sets the subsection of the form
  const origUserInfo = useRef(makeEntry(entryControl!.get()));
  const [sub, setSub] = useState(0);
  const [userInfo, setUserInfo] = useState(makeEntry(entryControl!.get()));
  const [timeOutSwitch, setTimeOutSwitch] = useState(true);

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
  const upD8Entry = async (): Promise<void> => {
    const userID = userControl!.get();
    try {
      // added for development
      // console.log(`userID: ${userID}`);
      // for (const [key, val] of Object.entries(userInfo)) {
      //   console.log(`key: ${key}, value: ${val}`);
      // }
      await upD8Data(
        userInfo,
        widget!,
        entryControl!.get()
      );
      Alert.alert('Success!', `${userInfo.org} entry has been updated`);
      changePage!(3);
    } catch (err) {
      Alert.alert(
        'Error',
        `There was a problem updating the ${userInfo.org} entry in the database: ${err}`
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

  const entryTable: LookupTable = {
    organization: 'org',
    username: 'login',
    password: 'passwordA',
    'confirm password': 'passwordB',
    pin: 'pinA',
    'confirm pin': 'pinB',
    email: 'email',
    url: 'url',
    'additional info': 'misc',
  };

  // function to generate placeholder content
  const getPlaceHolder = (inp: string): string => {
    const currVal = userInfo[entryTable[inp] as keyof EntryForm];
    return timeOutSwitch ? inp : currVal;
  };

  useEffect(() => {
    const killSwitch = setInterval(() => {
      // functional state update to ensure setTimeOutSwitch always has latest value
      setTimeOutSwitch((prev) => !prev);
    }, 1500);
    // cleanup function
    return () => clearInterval(killSwitch);
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {sub === 0 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'org')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder={getPlaceHolder('organization')}
            value={
              userInfo.org === origUserInfo.current.org ? '' : userInfo.org
            }
          />
        )}
        {sub === 0 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'login')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder={getPlaceHolder('username')}
            value={
              userInfo.login === origUserInfo.current.login
                ? ''
                : userInfo.login
            }
          />
        )}
        {sub === 1 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'passwordA')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder={getPlaceHolder('password')}
            value={
              userInfo.passwordA === origUserInfo.current.passwordA
                ? ''
                : userInfo.passwordA
            }
            secureTextEntry={true}
          />
        )}
        {sub === 1 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'passwordB')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder={getPlaceHolder('confirm password')}
            value={
              userInfo.passwordB === origUserInfo.current.passwordB
                ? ''
                : userInfo.passwordB
            }
            secureTextEntry={true}
          />
        )}
        {sub === 2 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'pinA')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder={getPlaceHolder('pin')}
            value={
              userInfo.pinA === origUserInfo.current.pinA ? '' : userInfo.pinA
            }
            secureTextEntry={true}
          />
        )}
        {sub === 2 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'pinB')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder={getPlaceHolder('confirm pin')}
            value={
              userInfo.pinB === origUserInfo.current.pinB ? '' : userInfo.pinB
            }
            secureTextEntry={true}
          />
        )}
        {sub === 3 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'email')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder={getPlaceHolder('email')}
            value={
              userInfo.email === origUserInfo.current.email
                ? ''
                : userInfo.email
            }
          />
        )}
        {sub === 3 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'url')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder={getPlaceHolder('url')}
            value={
              userInfo.url === origUserInfo.current.url ? '' : userInfo.url
            }
          />
        )}
        {sub === 4 && (
          <TextInput
            style={dynamicSty.inpBox}
            autoCapitalize='none'
            onChangeText={(inp) => editEntry(inp, 'misc')}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder={getPlaceHolder('additional info')}
            value={
              userInfo.misc === origUserInfo.current.misc ? '' : userInfo.misc
            }
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
          <RoundButton onPressFunc={() => upD8Entry()} label={'update'} />
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
