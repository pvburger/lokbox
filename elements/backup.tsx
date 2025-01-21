import { StyleSheet, View, Image, Pressable } from 'react-native';
import BackupIcon from '../assets/icon_backup.png';
import { backup } from '../util/database';
import { useModContext } from '../context/global';

export default function BackupDB() {
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
      <Pressable onPress={() => backup()}>
        <Image
          source={BackupIcon}
          style={[dynamicSty.tinyB, { marginLeft: 0.03 * globject.screen_h }]}
        />
      </Pressable>
    </View>
  );
}
