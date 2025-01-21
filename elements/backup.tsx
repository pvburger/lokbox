import { StyleSheet, View, Image, Alert, Pressable } from 'react-native';
import BackupPic from '../assets/icon_backup.png';
import { backup } from '../util/database';
import { useModContext } from '../context/global';

export default function BackupIcon() {
  // bring in global context
  const globject = useModContext();

  const dynamicSty = StyleSheet.create({
    tinyB: {
      height: globject.icon_size,
      width: globject.icon_size,
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
          style={[dynamicSty.tinyB, { marginLeft: 0.03 * globject.screen_h }]}
        />
      </Pressable>
    </View>
  );
}
