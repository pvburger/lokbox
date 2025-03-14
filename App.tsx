import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  Image,
  AppState,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import Logo from './assets/logo_lb.png';
import ExitIcon from './elements/exit';
import StatusIcon from './elements/status_light';
import MenuIcon from './elements/menu';
import VisibleIcon from './elements/visible';
import Title from './screens/0_title';
import Login from './screens/1_login';
import Register from './screens/2_register';
import Menu from './screens/3_menu';
import Check from './screens/4_check';
import AddInfo from './screens/5_add';
import Remove from './screens/6_remove';
import Download from './screens/7_download';
import ColorPicker from './screens/8_colors';
import Passgen from './screens/9_passgen';
import Pingen from './screens/10_pingen';
import UpdateList from './screens/11_updateList';
import UpdateForm from './screens/12_updateForm';
import Upload from './screens/13_upload';
import DelUsers from './screens/21_users';
import { reSet } from './util/common';
import { GlobalContext } from './context/global';
import { UserSettings, DataObj, DBEntry } from './types';
import Admin from './screens/20_admin';

export default function App() {
  // get screen dimensions and assign
  const windH = Dimensions.get('window').height;
  const windW = Dimensions.get('window').width;
  const scrH = Dimensions.get('screen').height;
  const scrW = Dimensions.get('screen').width;

  const [page, setPage] = useState(0);
  const [userID, setUserID] = useState(0);
  const [appState, setAppState] = useState('');
  const [widget, setWidget] = useState('');
  const [keeboard, setKeeboard] = useState(false);
  const [globals, setGlobals] = useState(new DataObj(windH, windW, scrH, scrW));
  const [cipherTxt, setCipherTxt] = useState(false);
  // used to pass DBEntry from screen 11 to screen 12
  const [entry, setEntry] = useState(new DBEntry());
  // used to prevent auto logout when picker is running
  const pickerRunning = useRef(false);

  // GENERICS - REVIEW IMPLEMENTATION
  const globalObj = {
    data: globals,
    setContext: <T extends keyof UserSettings>(
      prop: T,
      val: UserSettings[T]
    ): void => {
      const mySettings: UserSettings = { ...globals.settings };
      mySettings[prop] = val;
      setGlobals({ ...globals, settings: mySettings });
    },
    setAllContext: (inp: UserSettings): void => {
      setGlobals({ ...globals, settings: inp });
    },
  };

  const userControl = {
    get: () => {
      return userID;
    },
    set: (input: number) => {
      setUserID(input);
    },
  };

  const visControl = {
    get: () => {
      return cipherTxt;
    },
    set: () => {
      setCipherTxt((curr) => !curr);
    },
  };

  const entryControl = {
    get: () => {
      return entry;
    },
    set: (input: DBEntry) => {
      setEntry(input);
    },
  };

  const pickControl = {
    get: () => {
      return pickerRunning.current;
    },
    set: () => {
      pickerRunning.current = !pickerRunning.current;
    },
  };

  const pageControl = {
    get: () => {
      return page;
    },
    set: (input: number) => {
      setPage(input);
    },
  };

  // useEffect to establish listeners
  useEffect(() => {
    // add AppState event listener
    const myListener = AppState.addEventListener('change', (newAppState) =>
      setAppState(newAppState.toString())
    );

    // add Keyboard state event listener
    const keyboardOpenListener = Keyboard.addListener('keyboardDidShow', () => {
      console.log('keyboard status: open');
      setKeeboard(true);
    });

    const keyboardCloseListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        console.log('keyboard status: closed');
        setKeeboard(false);
      }
    );

    return () => {
      myListener.remove();
      keyboardOpenListener.remove();
      keyboardCloseListener.remove();
    };
  }, []);

  // useEffect cleans up after app is no longer in foreground, or when the user logs out
  useEffect(() => {
    // added for development
    // console.log(`appState: ${appState}`);
    // IIFE - Immediatly-invoked function to enable async-await inside useEffect
    (async () => {
      try {
        if (
          (page === 0 ||
            appState === 'background' ||
            appState === 'inactive') &&
          !pickerRunning.current
        ) {
          await reSet(pageControl.set);
          setUserID(0);
          setWidget('');
          setCipherTxt(false);
          setGlobals(new DataObj(windH, windW, scrH, scrW));
          console.log(`useEffect invoked; cleaning up state...`);
        }
      } catch (err) {
        throw new Error(
          `There was a problem resetting the application: ${err}`
        );
      }
    })();
  }, [page, appState]);

  return (
    <GlobalContext.Provider value={globalObj}>
      <SafeAreaView
        style={[
          styles.mainContainer,
          { backgroundColor: globals.settings.color },
        ]}
      >
        <StatusBar />
        <View style={styles.header}>
          <Image source={Logo} style={styles.image} />
        </View>
        <View style={styles.body}>
          {page === 20 && <Admin changePage={pageControl.set} />}
          {page === 0 && <Title changePage={pageControl.set} />}
          {page === 1 && (
            <Login
              changePage={pageControl.set}
              userControl={userControl}
              setWidget={setWidget}
              keeboard={keeboard}
            />
          )}
          {page === 2 && (
            <Register
              changePage={pageControl.set}
              userControl={userControl}
              setWidget={setWidget}
              keeboard={keeboard}
            />
          )}
          {page === 3 && <Menu changePage={pageControl.set} />}
          {page === 4 && (
            <Check
              changePage={pageControl.set}
              userControl={userControl}
              widget={widget}
              visControl={visControl}
            />
          )}
          {page === 5 && (
            <AddInfo
              changePage={pageControl.set}
              userControl={userControl}
              widget={widget}
            />
          )}
          {page === 6 && (
            <Remove
              changePage={pageControl.set}
              userControl={userControl}
              widget={widget}
            />
          )}
          {page === 7 && (
            <Download
              changePage={pageControl.set}
              userControl={userControl}
              widget={widget}
              keeboard={keeboard}
            />
          )}
          {page === 8 && (
            <ColorPicker userControl={userControl} widget={widget} />
          )}
          {page === 9 && <Passgen userControl={userControl} widget={widget} />}
          {page === 10 && <Pingen userControl={userControl} widget={widget} />}
          {page === 11 && (
            <UpdateList
              changePage={pageControl.set}
              userControl={userControl}
              widget={widget}
              entryControl={entryControl}
            />
          )}
          {page === 12 && (
            <UpdateForm
              changePage={pageControl.set}
              userControl={userControl}
              widget={widget}
              entryControl={entryControl}
            />
          )}
          {page === 13 && (
            <Upload
              changePage={pageControl.set}
              userControl={userControl}
              widget={widget}
              keeboard={keeboard}
              pickControl={pickControl}
            />
          )}
          {page === 21 && <DelUsers changePage={pageControl.set} />}
        </View>
        {!keeboard && (
          <View style={styles.footer}>
            <View style={styles.footLeft}>
              {page !== 0 && <ExitIcon changePage={pageControl.set} />}
              {page >= 4 && page <= 19 && (
                <MenuIcon changePage={pageControl.set} />
              )}
              {page === 4 && <VisibleIcon visControl={visControl} />}
            </View>
            <StatusIcon userControl={userControl} />
          </View>
        )}
      </SafeAreaView>
    </GlobalContext.Provider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    // added for development
    // borderColor: 'red',
    // borderWidth: 4,
  },
  header: {
    flex: 1,
    width: '100%',
    height: 0.13 * Dimensions.get('screen').height,
    minHeight: 0.13 * Dimensions.get('screen').height,
    maxHeight: 0.13 * Dimensions.get('screen').height,
    alignItems: 'center',
    justifyContent: 'flex-end',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  image: {
    width: '100%',
    height: 0.1 * Dimensions.get('screen').height,
    resizeMode: 'contain',
    // added for development
    // borderColor: '#e6e6e6',
    // borderWidth: 4,
  },
  body: {
    flex: 1,
    // resizeMode: 'contain',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // added for development
    // borderColor: 'yellow',
    // borderWidth: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 0.01 * Dimensions.get('screen').height,
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
