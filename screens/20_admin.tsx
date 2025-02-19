import { StyleSheet, View, Alert } from 'react-native';
import React from 'react';
import { RoundButton } from '../elements/buttons';
import { nuke, backup, restore } from '../util/database';
import { reSet } from '../util/common';
import { Props } from '../types';

// This component is only accessible by creating and logging into 'admin' account
export default function Admin({ changePage }: Props) {
  // wrapper for reSet function
  const cleanDB = async (): Promise<void> => {
    const runNuke = async () => {
      await nuke();
      Alert.alert('Success', 'Database has been deleted');
      await reSet(changePage);
    };

    try {
      Alert.alert(
        '!!! Warning !!!',
        'Selecting "OK" will result in all lokbox data being deleted from device',
        [
          { text: 'OK', onPress: () => runNuke() },
          {
            text: 'Cancel',
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', `There was a problem deleting the database: ${err}`);
    }
  };

  // wrapper for backup function
  const backupDB = async (): Promise<void> => {
    try {
      await backup();
      Alert.alert('Success', 'Database has been saved to the Downloads folder');
    } catch (err) {
      Alert.alert(
        'Error',
        `There was a problem backing up the database: ${err}`
      );
    }
  };

  // wrapper for restore function
  const restoreDB = async (): Promise<void> => {
    const runRestore = async () => {
      await restore();
      Alert.alert('Success', 'Database has been restored');
    };
    try {
      Alert.alert(
        '!!! Warning !!!',
        'Selecting "OK" will result in any pre-existing lokbox data being deleted from device',
        [
          { text: 'OK', onPress: () => runRestore() },
          {
            text: 'Cancel',
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        'Error',
        `There was a problem restoring the database: ${err}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <RoundButton onPressFunc={() => cleanDB()} label={'delete'} />
      <RoundButton onPressFunc={() => backupDB()} label={'backup'} />
      <RoundButton onPressFunc={() => restoreDB()} label={'restore'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});
