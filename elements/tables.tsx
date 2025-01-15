import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import TableIcon from '../assets/icon_tables.png';
import { printTables } from '../util/database';

export default function Tables() {

  return (
    <View>
      <Pressable style={styles.table} onPress={printTables}>
        <Image source={TableIcon} style={styles.table} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    height: 40,
    width: 40,
    marginRight: 40,
    // marginLeft: 20,
    resizeMode: 'contain',
  },
});
