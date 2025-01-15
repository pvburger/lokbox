import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import ResetIcon from '../assets/icon_delete.png';
import { SQLiteDB, nuke } from '../util/database';
import { reSet } from '../util/common';

export default function Clean({ changePage, userControl, setWidget }) {
  const cleanDB = async (): Promise<void> => {
    try {
      await nuke();
      await reSet(changePage, userControl, setWidget);
    } catch (err) {
      throw err;
    }
  };

  return (
    <View>
      <Pressable style={styles.cleanDB} onPress={cleanDB}>
        <Image source={ResetIcon} style={styles.cleanDB} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cleanDB: {
    height: 40,
    width: 40,
    marginRight: 40,
    // marginLeft: 5,
    resizeMode: 'contain',
  },
});
