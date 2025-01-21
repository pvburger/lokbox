import { StyleSheet, View, Image, Alert, Pressable } from 'react-native';
import ResetPic from '../assets/icon_delete.png';
import { nuke } from '../util/database';
import { reSet } from '../util/common';
import { useModContext } from '../context/global';

export default function CleanIcon({ changePage, userControl, setWidget }) {
  // bring in global context
  const globject = useModContext();

  const dynamicSty = StyleSheet.create({
    tinyB: {
      height: globject.icon_size,
      width: globject.icon_size,
      resizeMode: 'contain',
    },
  });

  // wrapper for reSet function
  const cleanDB = async (): Promise<void> => {
    try {
      await nuke();
      await reSet(changePage, userControl, setWidget);
      Alert.alert('Success', 'Database has been deleted');
    } catch (err) {
      Alert.alert('Error', `There was a problem deleting the database: ${err}`);
    }
  };

  return (
    <View>
      <Pressable onPress={cleanDB}>
        <Image
          source={ResetPic}
          style={[dynamicSty.tinyB, { marginLeft: 0.01 * globject.screen_h }]}
        />
      </Pressable>
    </View>
  );
}
