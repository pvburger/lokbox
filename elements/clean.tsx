import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import ResetIcon from '../assets/icon_delete.png';
// import ExitIcon from '../assets/icon_exit.png';
// import red_status from '../assets/led_red.png';
// import yellow_status from '../assets/led_yellow.png';
// import green_status from '../assets/led_green.png';
// import { tinyB } from '../styles';
import { SQLiteDB, nuke } from '../util/database';
import { reSet } from '../util/common';
// import { useModContext } from '../context/global';
import { useModContext } from '../context/global';

export default function Clean({ changePage, userControl, setWidget }) {
  const cleanDB = async (): Promise<void> => {
    try {
      await nuke();
      await reSet(changePage, userControl, setWidget);
    } catch (err) {
      throw err;
    }
  };

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
      <Pressable onPress={cleanDB}>
        <Image
          source={ResetIcon}
          style={[
            dynamicSty.tinyB,
            { marginLeft: Math.round(0.01 * globject.screen_h) },
          ]}
        />
      </Pressable>
    </View>
  );
}

// const styles = StyleSheet.create({
//   tinyButton: {
//     // resizeMode: 'contain',
//   },
// });
