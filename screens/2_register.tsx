import { StyleSheet, View, TextInput, Alert } from 'react-native';
import { RoundButton } from '../elements/buttons';
import { inputBox } from '../styles';
import { addUser, getDataSalt } from '../util/database';
import { useModContext } from '../context/global';

export default function Register({ changePage, userControl, setWidget }) {
  let username = '';
  let passwordA = '';
  let passwordB = '';

  // bring in global context
  const scrH = useModContext().screen_h;
  const dynamicSty = inputBox(scrH);

  // updater functions for username and password
  const updUser = (input: string): void => {
    username = input;
  };

  const updPass = (input: string, version: string): void => {
    version === 'A' ? (passwordA = input) : (passwordB = input);
  };

  // function to register user
  // handled by submit button
  const regUser = async () => {
    try {
      const userRow = await addUser(username, passwordA, passwordB);
      const salt = await getDataSalt(userRow);
      userControl.set(userRow);
      setWidget(salt);
      Alert.alert('Success!', `${username} has successfully logged in.`);
      changePage(3);
    } catch (error) {
      Alert.alert(
        'Error',
        `There was an error adding ${username} to the database: ${error}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <TextInput
          style={dynamicSty.inpBox}
          onChangeText={(inp) => updUser(inp)}
          placeholder='username'
        />
        <TextInput
          style={dynamicSty.inpBox}
          onChangeText={(inp) => updPass(inp, 'A')}
          placeholder='password'
          secureTextEntry={true}
        />
        <TextInput
          style={dynamicSty.inpBox}
          onChangeText={(inp) => updPass(inp, 'B')}
          placeholder='confirm password'
          secureTextEntry={true}
        />
      </View>
      <View style={styles.buttonContainer}>
        <RoundButton onPressFunc={regUser} label={'submit'} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});
