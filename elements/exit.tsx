import { StyleSheet, View, Image, Pressable } from 'react-native';
import ExitPic from '../assets/icon_exit.png';
import { reSet } from '../util/common';
import { useModContext } from '../context/global';
import { Props } from '../types';

export default function ExitIcon({
  changePage,
  userControl,
  setWidget,
}: Props) {
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

  const reSetWrap = async (): Promise<void> => {
    try {
      await reSet(changePage);
    } catch (err) {
      throw err;
    }
  };

  return (
    <View>
      <Pressable onPress={reSetWrap}>
        <Image
          source={ExitPic}
          style={[dynamicSty.tinyB, { marginLeft: 0.01 * scrH }]}
        />
      </Pressable>
    </View>
  );
}
