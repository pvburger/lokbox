import { StyleSheet, Text, View, Pressable } from 'react-native';

export function RegButton({ onPressFunc, label }) {
  return (
    <Pressable style={styles.regButton} onPress={() => onPressFunc()}>
      <Text style={styles.regButtonTxt}>{label}</Text>
    </Pressable>
  );
}

export function RoundButton({ onPressFunc, label }) {
  return (
    <Pressable style={styles.roundButton} onPress={() => onPressFunc()}>
      <Text style={styles.roundButtonTxt}>{label}</Text>
    </Pressable>
  );
}

export function RoundButtonSm({ onPressFunc, label }) {
  return (
    <Pressable style={styles.roundButtonSm} onPress={() => onPressFunc()}>
      <Text style={styles.roundButtonSmTxt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  regButton: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 25,
    width: 350,
    height: 100,
    borderRadius: 25,
    borderColor: 'black',
    borderWidth: 4,
    backgroundColor: 'white',
    elevation: 5,
  },
  regButtonTxt: {
    color: 'black',
    fontSize: 40,
  },
  roundButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 25,
    borderColor: 'black',
    borderWidth: 4,
    backgroundColor: 'white',
    elevation: 5,
  },
  roundButtonTxt: {
    color: 'black',
    fontSize: 25,
  },
  roundButtonSm: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 25,
    borderColor: 'black',
    borderWidth: 4,
    backgroundColor: 'white',
    elevation: 5,
  },
  roundButtonSmTxt: {
    color: 'black',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
