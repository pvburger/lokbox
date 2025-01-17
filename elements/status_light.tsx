import { StyleSheet, View, Image } from 'react-native';
import red_status from '../assets/led_red.png';
import yellow_status from '../assets/led_yellow.png';
import green_status from '../assets/led_green.png';
// import { tinyB } from '../styles';
import { useModContext } from '../context/global';

export default function Status({ userControl }) {
  // bring in global context
  const globject = useModContext();

  const dynamicSty = StyleSheet.create({
    tinyB: {
      height: globject.icon_size,
      width: globject.icon_size,
      // margin: 0.5 * heightDP,
      resizeMode: 'contain',
    },
  });

  return (
    <View>
      {userControl.get() === 0 && (
        <Image
          source={red_status}
          style={[
            dynamicSty.tinyB,
            { marginRight: Math.round(0.01 * globject.screen_h) },
          ]}
        />
      )}
      {userControl.get() !== 0 && (
        <Image
          source={green_status}
          style={[
            dynamicSty.tinyB,
            { marginRight: Math.round(0.01 * globject.screen_h) },
          ]}
        />
      )}
    </View>
  );
}

// const styles = StyleSheet.create({
//   light: {
//     width: 40,
//     height: 40,
//     // marginRight: 5,
//     marginLeft: 40,
//     resizeMode: 'contain',
//   },
// });
