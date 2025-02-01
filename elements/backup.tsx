import { StyleSheet, View, Image, Alert, Pressable } from 'react-native';
import BackupPic from '../assets/icon_backup.png';
import { backup } from '../util/database';
import { useModContext } from '../context/global';

export default function BackupIcon() {
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

  // wrapper for backup function
  const backupDB = async (): Promise<void> => {
    try {
      await backup();
      Alert.alert('Success', 'Database has been saved to the Documents folder');
    } catch (err) {
      Alert.alert(
        'Error',
        `There was a problem backing up the database: ${err}`
      );
    }
  };

  return (
    <View>
      <Pressable onPress={() => backupDB()}>
        <Image
          source={BackupPic}
          style={[dynamicSty.tinyB, { marginLeft: 0.03 * scrH }]}
        />
      </Pressable>
    </View>
  );
}
