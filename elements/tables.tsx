import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import TableIcon from '../assets/icon_tables.png';
// import { tinyB } from '../styles';
import { printTables } from '../util/database';
import { useModContext } from '../context/global';

export default function Tables() {
  // bring in global context
  const globject = useModContext();

  const dynamicSty = StyleSheet.create({
    tinyB: {
      height: globject.icon_size,
      width: globject.icon_size,
      // margin: 0.5 * heightDP,
      resizeMode: 'contain',
    },
  });

  return (
    <View>
      <Pressable onPress={printTables}>
        <Image
          source={TableIcon}
          style={[
            dynamicSty.tinyB,
            { marginLeft: Math.round(0.01 * globject.screen_h) },
          ]}
        />
      </Pressable>
    </View>
  );
}

// const styles = StyleSheet.create({
//   table: {
//     height: 40,
//     width: 40,
//     marginRight: 40,
//     // marginLeft: 20,
//     resizeMode: 'contain',
//   },
// });
