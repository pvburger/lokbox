import { StyleSheet, View, Image, Pressable } from 'react-native';
import ExitPic from '../assets/icon_exit.png';
import { useModContext } from '../context/global';
import { Props } from '../types';

export default function ExitIcon({ changePage }: Props) {
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
      <Pressable onPress={() => changePage!(0)}>
        <Image
          source={ExitPic}
          style={[dynamicSty.tinyB, { marginLeft: 0.01 * scrH }]}
        />
      </Pressable>
    </View>
  );
}
