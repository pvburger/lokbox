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

export default function Check({
  changePage,
  userControl,
  widget,
  visControl,
}: Props) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // bring in global context
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;

  // dynamic stylesheet
  const dynamicSty = StyleSheet.create({
    scrollContainer: {
      marginTop: 0.02 * scrH,
      marginBottom: 0.02 * scrH,
      borderRadius: 0.02 * scrH,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
    },
    scrollBox: {
      marginHorizontal: 0.02 * scrH,
    },
    text: {
      fontSize: 0.015 * scrH,
    },
    textHeader: {
      fontSize: 0.018 * scrH,
      marginTop: 0.02 * scrH,
      marginBottom: 0.01 * scrH,
    },
  });
  const staticSty = styles;

  const getText = async (): Promise<void> => {
    try {
      const data = await getAllDataAsString(
        userControl!.get(),
        widget!,
        visControl!.get()
      );

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
    // will cause re-render when cipherTxt state variable changes
    (async () => {
      await getText();
      setIsLoading(false);
    })();
  }, [visControl!.get()]);

  // don't render until loading is finished
  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[dynamicSty.scrollContainer, staticSty.scrollContainer]}>
        <View style={styles.textHeaderContainer}>
          <Text style={[dynamicSty.textHeader, staticSty.textHeader]}>
            DATA
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={[dynamicSty.scrollBox, staticSty.scrollBox]}
        >
          <Text style={[dynamicSty.text, staticSty.text]}>{text}</Text>
        </ScrollView>
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
  scrollContainer: {
    flex: 1,
    width: '90%',
    backgroundColor: 'white',
    borderColor: 'black',
    alignItems: 'center',
    // added for development
    // borderColor: 'red',
    // borderWidth: 4,
  },
  scrollBox: {
    flexGrow: 1,
  },
  textHeaderContainer: {
    width: '100%',
    alignItems: 'center',
    // added for development
    // borderColor: 'red',
    // borderWidth: 4,
  },
  textHeader: {
    color: '#808080',
    fontStyle: 'italic',
  },
  text: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
