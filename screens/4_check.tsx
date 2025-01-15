import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { RoundButton } from '../elements/buttons';
import { getAllDataAsString } from '../util/database';

export default function Check({ changePage, userControl, widget }) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const getText = async (): Promise<void> => {
    try {
      const data = await getAllDataAsString(userControl.get(), widget);
      if (data === '') {
        throw new Error(`User has no data stored in the database`);
      }
      setText(data);
      setIsLoading(true);
    } catch (err) {
      Alert.alert('Error', `${err}`);
      changePage(3);
    }
  };

  /*
  *****
  This illustrates one way to deal with errors which might be thrown by an async function with a return
  type of 'void' within a useEffect, which needs to be seen by the end user.
  As no value is returned to useEffect, useEffect thinks the function ran normally, so it cannot be used
  to throw an error, and the error must be returned to the user by the async function itself, 
  in this case 'getAllDataAsString'
 *****
 */
  useEffect(() => {
    // run as IIFE (immediately invoked function)
    (async () => {
      await getText();
      setIsLoading(false);
    })();
  }, []);

  // don't render until loading is finished
  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.scrollContainer}>
        <ScrollView
          style={styles.scrollBox}
          contentContainerStyle={{ padding: 10 }}
        >
          <Text style={styles.text}>{text}</Text>
        </ScrollView>
      </View>
      <View style={styles.buttonContainer}>
        <RoundButton onPressFunc={() => changePage(3)} label={'menu'} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  scrollContainer: {
    width: '100%',
    height: '82%',
    // added for development
    // borderColor: 'red',
    // borderWidth: 4,
  },
  scrollBox: {
    backgroundColor: 'white',
    width: '90%',
    margin: 25,
    borderRadius: 25,
    borderColor: 'black',
    borderWidth: 4,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  text: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
