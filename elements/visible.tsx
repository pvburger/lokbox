import { StyleSheet, View, Image, Pressable } from 'react-native';
import { useModContext } from '../context/global';
import OpenIcon from '../assets/icon_open.png';
import CloseIcon from '../assets/icon_close.png';
import { Props } from '../types';

export default function VisibleIcon({ visControl }: Props) {

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
      <Pressable onPress={() => visControl!.set()}>
        <Image
          source={visControl!.get() ? OpenIcon : CloseIcon}
          style={[dynamicSty.tinyB, { marginLeft: 0.03 * scrH }]}
        />
      </Pressable>
    </View>
  );
}
