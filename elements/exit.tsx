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
  // bring in global context
  const globject = useModContext();

  const dynamicSty = StyleSheet.create({
    tinyB: {
      height: globject.icon_size,
      width: globject.icon_size,
      resizeMode: 'contain',
    },
  });

  const reSetWrap = async (): Promise<void> => {
    try {
      await reSet(changePage, userControl, setWidget);
    } catch (err) {
      throw err;
    }
  };

  return (
    <View>
      <Pressable onPress={reSetWrap}>
        <Image
          source={ExitPic}
          style={[dynamicSty.tinyB, { marginLeft: 0.01 * globject.screen_h }]}
        />
      </Pressable>
    </View>
  );
}
