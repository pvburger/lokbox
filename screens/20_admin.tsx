import { StyleSheet, View, Alert } from 'react-native';
import React from 'react';
import { RoundButton } from '../elements/buttons';
import { nuke, backup, restore } from '../util/database';
import { reSet } from '../util/common';

export default function Admin({ changePage, userControl, setWidget }) {
  // wrapper for reSet function
  const cleanDB = async (): Promise<void> => {
    try {
      await nuke();
      await reSet(changePage, userControl, setWidget);
      Alert.alert('Success', 'Database has been deleted');
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
    try {
      await restore();
      Alert.alert('Success', 'Database has been restored');
    } catch (err) {
      Alert.alert(
        'Error',
        `There was a problem restoring the database: ${err}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <RoundButton onPressFunc={() => cleanDB()} label={'drop'} />
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

// export default Menu;
