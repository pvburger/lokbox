import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import TableIcon from '../assets/icon_tables.png';
// import { tinyB } from '../styles';
import { printTables } from '../util/database';
import { useModContext } from '../context/global';

export default function Tables() {
  // // bring in global context
  // const globject = useModContext();

  // bring in global context
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;
  const iconS = globalObj.data.dimensions.icon_S;

  const dynamicSty = StyleSheet.create({
    tinyB: {
      height: iconS,
      width: iconS,
      resizeMode: 'contain',
    },
  });

  return (
    <View>
      <Pressable onPress={() => printTables()}>
        <Image
          source={TableIcon}
          style={[dynamicSty.tinyB, { marginLeft: 0.03 * scrH }]}
        />
      </Pressable>
    </View>
  );
}
