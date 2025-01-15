import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import ExitIcon from '../assets/icon_exit.png';
import { SQLiteDB } from '../util/database';
import { reSet } from '../util/common';

export default function Exit({ changePage, userControl, setWidget }) {

  const reSetWrap = async (): Promise<void> => {
    try {
      await reSet(changePage, userControl, setWidget);
    } catch (err) {
      throw err;
    }
  };

  return (
    <View>
      <Pressable style={styles.exit} onPress={reSetWrap}>
        <Image source={ExitIcon} style={styles.exit} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  exit: {
    height: 40,
    width: 40,
    marginRight: 40,
    // marginLeft: 5,
    resizeMode: 'contain',
  },
});
