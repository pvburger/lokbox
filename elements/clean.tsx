import { StyleSheet, View, Image, Alert, Pressable } from 'react-native';
import ResetPic from '../assets/icon_delete.png';
import { nuke } from '../util/database';
import { reSet } from '../util/common';
import { useModContext } from '../context/global';
import { Props } from '../types';

export default function CleanIcon({
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

  // wrapper for reSet function
  const cleanDB = async (): Promise<void> => {
    try {
      await nuke();
      await reSet(changePage);
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
          style={[dynamicSty.tinyB, { marginLeft: 0.01 * scrH }]}
        />
      </Pressable>
    </View>
  );
}
