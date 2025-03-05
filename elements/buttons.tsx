import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useModContext } from '../context/global';
import { Props } from '../types';

export function RegButton({ onPressFunc, label }: Props) {
  // bring in global context
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;

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

  const funcWrap = () => {
    if (onPressFunc !== undefined) {
      onPressFunc();
    }
  };

  return (
    <Pressable
      style={[dynamicSty.regButton, staticSty.regButton]}
      onPress={() => funcWrap()}
    >
      <Text style={[dynamicSty.regButtonTxt, staticSty.regButtonTxt]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ThinButton({ onPressFunc, label }: Props) {
  // bring in global context
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;

  const dynamicSty = StyleSheet.create({
    thinButton: {
      height: 0.05 * scrH,
      width: 0.22 * scrH,
      marginTop: 0.01 * scrH,
      marginBottom: 0.01 * scrH,
      borderRadius: 0.015 * scrH,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
    },
    thinButtonTxt: {
      fontSize: 0.021 * scrH,
    },
  });
  const staticSty = styles;

  const funcWrap = () => {
    if (onPressFunc !== undefined) {
      onPressFunc();
    }
  };

  return (
    <Pressable
      style={[dynamicSty.thinButton, staticSty.regButton]}
      onPress={() => funcWrap()}
    >
      <Text style={[dynamicSty.thinButtonTxt, staticSty.regButtonTxt]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function RoundButton({ onPressFunc, label }: Props) {
  // bring in global context
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;

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
      fontSize: 0.018 * scrH,
    },
  });

  const staticSty = styles;

  const funcWrap = () => {
    if (onPressFunc !== undefined) {
      onPressFunc();
    }
  };

  return (
    <Pressable
      style={[dynamicSty.roundButton, staticSty.roundButton]}
      onPress={() => funcWrap()}
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
    borderColor: 'black',
    backgroundColor: 'white',
  },
  roundButtonTxt: {
    color: 'black',
  },
});
