import { StyleSheet, View, Image, Pressable } from 'react-native';
import { useModContext } from '../context/global';
import MenuPic from '../assets/icon_menu.png';
import { Props } from '../types';

export default function MenuIcon({ changePage }: Props) {
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
      <Pressable onPress={() => changePage!(3)}>
        <Image
          source={MenuPic}
          style={[dynamicSty.tinyB, { marginLeft: 0.03 * scrH }]}
        />
      </Pressable>
    </View>
  );
}
