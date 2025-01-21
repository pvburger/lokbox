import { StyleSheet, View, Image, Pressable } from 'react-native';
import RestoreIcon from '../assets/icon_restore.png';
import { restore } from '../util/database';
import { useModContext } from '../context/global';

export default function RestoreDB() {
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
      <Pressable onPress={() => restore()}>
        <Image
          source={RestoreIcon}
          style={[dynamicSty.tinyB, { marginLeft: 0.03 * globject.screen_h }]}
        />
      </Pressable>
    </View>
  );
}
