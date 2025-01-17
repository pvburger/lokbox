import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useModContext } from '../context/global';
// import { per2Dp } from '../util/general';

export function RegButton({ onPressFunc, label }) {
  // bring in global context
  const scrH = useModContext().screen_h;

  const dynamicSty = StyleSheet.create({
    regButton: {
      height: 0.08 * scrH,
      width: 0.3 * scrH,
      marginTop: 0.01 * scrH,
      marginBottom: 0.01 * scrH,
      borderRadius: 0.02 * scrH,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
    },
    regButtonTxt: {
      fontSize: 0.035 * scrH,
    },
  });
  const staticSty = styles;

  return (
    <Pressable
      style={[dynamicSty.regButton, staticSty.regButton]}
      onPress={() => onPressFunc()}
    >
      <Text style={[dynamicSty.regButtonTxt, staticSty.regButtonTxt]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function RoundButton({ onPressFunc, label }) {
  // bring in global context
  const scrH = useModContext().screen_h;

  const dynamicSty = StyleSheet.create({
    roundButton: {
      height: 0.08 * scrH,
      width: 0.08 * scrH,
      marginTop: 0.01 * scrH,
      marginBottom: 0.01 * scrH,
      borderRadius: (0.08 * scrH) / 2,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
    },
    roundButtonTxt: {
      fontSize: 0.02 * scrH,
    },
  });

  const staticSty = styles;
  return (
    <Pressable
      style={[dynamicSty.roundButton, staticSty.roundButton]}
      onPress={() => onPressFunc()}
    >
      <Text style={[dynamicSty.roundButtonTxt, staticSty.roundButtonTxt]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  regButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'black',
    backgroundColor: 'white',
  },
  regButtonTxt: {
    color: 'black',
  },
  roundButton: {
    alignItems: 'center',
    justifyContent: 'center',
    // width: 100,
    // height: 100,
    // borderRadius: 50,
    // margin: 25,
    borderColor: 'black',
    // borderWidth: 4,
    backgroundColor: 'white',
    // elevation: 5,
  },
  roundButtonTxt: {
    color: 'black',
    // fontSize: 25,
  },
  /*
  roundButtonSm: {
    alignItems: 'center',
    justifyContent: 'center',
    // width: 50,
    // height: 50,
    // borderRadius: 25,
    // margin: 25,
    borderColor: 'black',
    // borderWidth: 4,
    backgroundColor: 'white',
    // elevation: 5,
  },
  roundButtonSmTxt: {
    color: 'black',
    // fontSize: 30,
    fontWeight: 'bold',
  },
  */
});
