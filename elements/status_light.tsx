import { StyleSheet, View, Image } from 'react-native';
import red_status from '../assets/led_red.png';
import green_status from '../assets/led_green.png';
import { useModContext } from '../context/global';
import { Props } from '../types';

export default function StatusIcon({ userControl }: Props) {
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
      {userControl!.get() === 0 && (
        <Image
          source={red_status}
          style={[dynamicSty.tinyB, { marginRight: 0.01 * scrH }]}
        />
      )}
      {userControl!.get() !== 0 && (
        <Image
          source={green_status}
          style={[dynamicSty.tinyB, { marginRight: 0.01 * scrH }]}
        />
      )}
    </View>
  );
}
