import { StyleSheet, View, Image, Alert, Pressable } from 'react-native';
import RestorePic from '../assets/icon_restore.png';
import { restore } from '../util/database';
import { useModContext } from '../context/global';

export default function RestoreIcon() {
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

  // wrapper for restore function
  const restoreDB = async (): Promise<void> => {
    try {
      await restore();
      Alert.alert('Success', 'Database has been restored');
    } catch (err) {
      Alert.alert(
        'Error',
        `There was a problem restoring the database: ${err}`
      );
    }
  };

  return (
    <View>
      <Pressable onPress={() => restoreDB()}>
        <Image
          source={RestorePic}
          style={[dynamicSty.tinyB, { marginLeft: 0.03 * scrH }]}
        />
      </Pressable>
    </View>
  );
}
