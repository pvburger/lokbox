import { StyleSheet, View, Image, Pressable } from 'react-native';
import { useModContext } from '../context/global';
import SettingsPic from '../assets/icon_settings.png';
import { Props } from '../types';

export default function AdminIcon({ changePage }: Props) {
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
      <Pressable onPress={() => changePage!(20)}>
        <Image
          source={SettingsPic}
          style={[dynamicSty.tinyB, { marginLeft: 0.01 * scrH }]}
        />
      </Pressable>
    </View>
  );
}
