import {
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { getAllDataAsString } from '../util/database';
import { useModContext } from '../context/global';
import { Props } from '../types';

export default function Check({ changePage, userControl, widget }: Props) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // bring in global context
  const scrH = useModContext().screen_h;

  // dynamic stylesheet
  const dynamicSty = StyleSheet.create({
    scrollBox: {
      marginTop: 0.02 * scrH,
      marginBottom: 0.02 * scrH,
      borderRadius: 0.02 * scrH,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
      padding: 0.01 * scrH,
    },
    text: {
      fontSize: 0.015 * scrH,
    },
  });
  const staticSty = styles;

  const getText = async (): Promise<void> => {
    try {
      const data = await getAllDataAsString(userControl!.get(), widget!);
      if (data === '') {
        throw new Error(`User has no data stored in the database`);
      }
      setText(data);
      setIsLoading(true);
    } catch (err) {
      Alert.alert('Error', `${err}`);
      changePage!(3);
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
        <ScrollView style={[dynamicSty.scrollBox, staticSty.scrollBox]}>
          <Text style={[dynamicSty.text, staticSty.text]}>{text}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
    // added for development
    // borderColor: 'red',
    // borderWidth: 4,
  },
  scrollBox: {
    backgroundColor: 'white',
    width: '90%',
    borderColor: 'black',
  },
  text: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
