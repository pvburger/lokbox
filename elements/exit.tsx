import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import ExitIcon from '../assets/icon_exit.png';
// import { tinyB } from '../styles';
import { SQLiteDB } from '../util/database';
import { reSet } from '../util/common';
import { useModContext } from '../context/global';

export default function Exit({ changePage, userControl, setWidget }) {
  const reSetWrap = async (): Promise<void> => {
    try {
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
      <Pressable onPress={reSetWrap}>
        <Image
          source={ExitIcon}
          style={[dynamicSty.tinyB, { marginLeft: 0.01 * globject.screen_h }]}
        />
      </Pressable>
    </View>
  );
}

// const styles = StyleSheet.create({
//   tinyB: {
//     height: heightDP.,
//     width: heightDP.,
//     margin: heightDP.,
//     // marginLeft: 5,
//     resizeMode: 'contain',
//   },
// });
