import { StyleSheet, View, Image, Pressable } from 'react-native';
import { useModContext } from '../context/global';
import SettingsPic from '../assets/icon_settings.png';

export default function AdminIcon({ changePage }) {
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
      <Pressable onPress={() => changePage(-1)}>
        <Image
          source={SettingsPic}
          style={[dynamicSty.tinyB, { marginLeft: 0.01 * globject.screen_h }]}
        />
      </Pressable>
    </View>
  );
}
