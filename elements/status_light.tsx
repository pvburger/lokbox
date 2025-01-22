import { StyleSheet, View, Image } from 'react-native';
import red_status from '../assets/led_red.png';
import green_status from '../assets/led_green.png';
import { useModContext } from '../context/global';

export default function StatusIcon({ userControl }) {
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
      {userControl.get() === 0 && (
        <Image
          source={red_status}
          style={[dynamicSty.tinyB, { marginRight: 0.01 * globject.screen_h }]}
        />
      )}
      {userControl.get() !== 0 && (
        <Image
          source={green_status}
          style={[dynamicSty.tinyB, { marginRight: 0.01 * globject.screen_h }]}
        />
      )}
    </View>
  );
}
