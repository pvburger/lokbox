import { StyleSheet, View, Image, Pressable } from 'react-native';
import { useModContext } from '../context/global';
import MenuPic from '../assets/icon_menu.png';
import { Props } from '../types';

export default function MenuIcon({ changePage }: Props) {
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
      <Pressable onPress={() => changePage!(3)}>
        <Image
          source={MenuPic}
          style={[dynamicSty.tinyB, { marginLeft: 0.03 * globject.screen_h }]}
        />
      </Pressable>
    </View>
  );
}
