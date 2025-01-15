import { StyleSheet, View, Image } from 'react-native';
import red_status from '../assets/led_red.png';
import yellow_status from '../assets/led_yellow.png';
import green_status from '../assets/led_green.png';

export default function Status({ userControl }) {
  return (
    <View>
      {userControl.get() === 0 && (
        <Image source={red_status} style={styles.light} />
      )}
      {userControl.get() !== 0 && (
        <Image source={green_status} style={styles.light} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  light: {
    width: 40,
    height: 40,
    // marginRight: 5,
    marginLeft: 40,
    resizeMode: 'contain',
  },
});
