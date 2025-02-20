import { StyleSheet, View, Alert } from 'react-native';
import React from 'react';
import { RoundButton } from '../elements/buttons';
import { nuke, backup, restore, printTables } from '../util/database';
import { reSet } from '../util/common';
import { Props } from '../types';

// This component is only accessible by creating and logging into 'admin' account
export default function Admin({ changePage }: Props) {
  // if set to true, will log select information from database tables to console
  const logTables = false;

  // if logTables, then printTables
  logTables && printTables();

  // wrapper for reSet function
  const cleanDB = async (): Promise<void> => {
    const runNuke = async () => {
      try {
        await nuke();
        Alert.alert('Success', 'Database has been deleted');
        // force logout as current 'admin' account no longer exists
        await reSet(changePage);
      } catch (err) {
        Alert.alert(
          'Error',
          `There was a problem deleting the database: ${err}`
        );
      }
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
      // this is likely unnecessary; onPress function will not return error to calling function
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
      try {
        await restore();
        Alert.alert('Success', 'Database has been restored');
      } catch (err) {
        Alert.alert(
          'Error',
          `There was a problem restoring the database: ${err}`
        );
      } finally {
        /*
        force logout as either a) current 'admin' account no longer exists (if restore was successful), 
        b) timer in restore function expired before getting user file selection indicating device has
        become inactive for an extended period, or c) lokbox application is in the background/inactive
        and admin account should be logged out
        */
        await reSet(changePage);
      }
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
      // this is likely unnecessary; onPress function will not return error to calling function
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
