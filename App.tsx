import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Alert,
  AppState,
  AppStateStatus,
  Keyboard,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import Logo from './assets/logo_transparent.png';
import Exit from './elements/exit';
import Status from './elements/status_light';
import Clean from './elements/clean';
import Tables from './elements/tables';
// import { printTables } from './util/database';
import Title from './screens/0_title';
import Login from './screens/1_login';
import Register from './screens/2_register';
import Menu from './screens/3_menu';
import Check from './screens/4_check';
import AddInfo from './screens/5_add';
import Remove from './screens/6_remove';
import { reSet } from './util/common';
import { GlobalContext } from './context/global';
import { ContextObj } from './types';
// import Remove from './screens/6_remove';

export default function App() {
  const [page, setPage] = useState(0);
  const [userID, setUserID] = useState(0);
  const [appState, setAppState] = useState('');
  const [widget, setWidget] = useState('');
  const [keeboard, setKeeboard] = useState(false);

  // globalObj to be used with GlobalContext.provider
  const globject: ContextObj = {
    screen_h: Dimensions.get('window').height,
    screen_w: Dimensions.get('window').width,
  };

  const userControl = {
    get: () => {
      return userID;
    },
    set: (input: number) => {
      setUserID(input);
    },
  };

  const reSetWrap = async (): Promise<void> => {
    try {
      await reSet(setPage, userControl, setWidget);
    } catch (err) {
      throw err;
    }
  };

  // function to handle inactivity or application no longer in foreground
  const handleUnFocus = async () => {
    // added for development
    // console.log(`Running handleUnFocus; appState: ${appState}`);
    if (appState === 'background' || appState === 'inactive') {
      try {
        // added for development
        // console.log('running handleUnFocus');
        await reSetWrap();
      } catch (err) {
        throw err;
      }
    }
  };

  // useEffect cleans up after app is no longer in foreground
  useEffect(() => {
    // added during development
    console.log(`useEffect invoked; appState: ${appState}`);

    // add event listener
    const myListener = AppState.addEventListener('change', (newAppState) =>
      setAppState(newAppState.toString())
    );

    handleUnFocus();

    // cleanup
    return () => {
      myListener.remove();
    };
  }, [appState]);

  // useEffect to set keyboard state
  useEffect(() => {
    // added during development

    const keyboardOpenListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeeboard(true);
    });

    const keyboardCloseListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeeboard(false);
      }
    );

    console.log(`useEffect invoked; keyboard visible: ${keeboard.toString()}`);

    return () => {
      keyboardOpenListener.remove();
      keyboardCloseListener.remove();
    };
  }, [keeboard]);

  return (
    <GlobalContext.Provider value={globject}>
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar />
        <View style={styles.header}>
          <Image source={Logo} style={styles.image} />
        </View>
        <View style={styles.body}>
          {page === 0 && <Title changePage={setPage} />}
          {page === 1 && (
            <Login
              changePage={setPage}
              userControl={userControl}
              setWidget={setWidget}
            />
          )}
          {page === 2 && (
            <Register
              changePage={setPage}
              userControl={userControl}
              setWidget={setWidget}
            />
          )}
          {page === 3 && <Menu changePage={setPage} />}
          {page === 4 && (
            <Check
              changePage={setPage}
              userControl={userControl}
              widget={widget}
            />
          )}
          {page === 5 && (
            <AddInfo
              changePage={setPage}
              userControl={userControl}
              widget={widget}
            />
          )}
          {page === 6 && (
            <Remove
              changePage={setPage}
              userControl={userControl}
              widget={widget}
            />
          )}
        </View>
        {!keeboard && (
          <View style={styles.footer}>
            <View style={styles.footLeft}>
              {page !== 0 && (
                <Exit
                  changePage={setPage}
                  userControl={userControl}
                  setWidget={setWidget}
                />
              )}
              {page === 0 && (
                <Clean
                  changePage={setPage}
                  userControl={userControl}
                  setWidget={setWidget}
                />
              )}
              {page === 0 && <Tables />}
            </View>
            <Status userControl={userControl}></Status>
          </View>
        )}
      </SafeAreaView>
    </GlobalContext.Provider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    // backgroundColor: '#45b6fe',
    backgroundColor: '#d3d3d3',
    alignItems: 'center',
    justifyContent: 'space-between',
    // added for development
    // borderColor: 'red',
    // borderWidth: 4,
  },
  header: {
    flex: 1,
    width: '100%',
    height: 0.15 * Dimensions.get('window').height,
    minHeight: 0.15 * Dimensions.get('window').height,
    maxHeight: 0.15 * Dimensions.get('window').height,
    alignItems: 'center',
    justifyContent: 'flex-end',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  image: {
    width: '90%',
    height: '60%',
    resizeMode: 'contain',
    // added for development
    // borderColor: '#e6e6e6',
    // borderWidth: 4,
  },
  body: {
    width: '100%',
    height: '78%',
    resizeMode: 'contain',
    alignItems: 'center',
    justifyContent: 'center',
    // added for development
    // borderColor: 'yellow',
    // borderWidth: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
    height: '5%',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  footLeft: {
    flexDirection: 'row',
    width: '50%',
    // added for development
    // borderColor: 'green',
    // borderWidth: 4,
  },
});
