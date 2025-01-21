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
      resizeMode: 'contain',
    },
  });

  return (
    <View>
      <Pressable onPress={() => printTables()}>
        <Image
          source={TableIcon}
          style={[dynamicSty.tinyB, { marginLeft: 0.03 * globject.screen_h }]}
        />
      </Pressable>
    </View>
  );
}
