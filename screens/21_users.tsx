import {
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { RoundButton } from '../elements/buttons';
import { removeUsers, getUsers } from '../util/database';
import { FListEntry, Props } from '../types';
import { useModContext } from '../context/global';
import { reSet } from '../util/common';

export default function DelUsers({ changePage }: Props) {
  const [usrList, setUsrList] = useState<FListEntry[]>([]);
  const [selections, setSelections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // bring in global context
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;

  // dynamic styleheet
  const dynamicSty = StyleSheet.create({
    smButton: {
      height: 0.042 * scrH,
      width: 0.042 * scrH,
      marginVertical: 0.01 * scrH,
      marginHorizontal: 0.02 * scrH,
      borderRadius: (0.042 * scrH) / 2,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
    },
    smButtonTxt: {
      fontSize: 0.02 * scrH,
    },
    fListContainer: {
      marginTop: 0.02 * scrH,
      marginBottom: 0.01 * scrH,
      borderRadius: 0.02 * scrH,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
    },
    textHeader: {
      fontSize: 0.018 * scrH,
      marginTop: 0.02 * scrH,
      marginBottom: 0.01 * scrH,
    },
    orgText: {
      fontSize: 0.03 * scrH,
    },
  });
  const staticSty = styles;

  // shorten user name if greater than 13 characters
  const shorten = (inp: string): string => {
    if (inp.length > 16) {
      return inp.slice(0, 16) + '...';
    } else {
      return inp;
    }
  };

  // check if user occurs in selections
  // returns index of corresponding array entry or -1 if there is no such entry
  const checkForUsr = (usrName: string): number => {
    for (let i = 0; i < selections.length; i++) {
      if (selections[i] === usrName) {
        return i;
      }
    }
    return -1;
  };

  // modify button on select and add/remove entry to/from 'selections' state variable
  const reverse = (usrName: string): void => {
    const usrNameIdx = checkForUsr(usrName);

    if (usrNameIdx !== -1) {
      // remove entry from selections
      setSelections([
        ...selections.slice(0, usrNameIdx),
        ...selections.slice(usrNameIdx + 1),
      ]);
    } else {
      // add entry to selections
      const tempArr: string[] = [...selections];
      tempArr.push(usrName);
      setSelections(tempArr);
    }
  };

  const deleteEntries = async (): Promise<void> => {
    try {
      await removeUsers(selections);
      Alert.alert(
        'Success',
        `Users (${selections.join(', ')}) removed from database`
      );
      // reset application in case admin removed
      await reSet(changePage);
    } catch (err) {
      Alert.alert(
        `There was a problem removing users from the database: ${err}`
      );
    }
  };

  // populates usrList (to populate Flat List)
  const genUsers = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // get array of database users from database
      const usrNameArr = await getUsers();

      // user list should never be empty as admin account is required to run this component
      if (usrNameArr.length === 0) {
        throw new Error('User database is empty');
      }

      const resultArr: FListEntry[] = [];
      let counter = 1;

      for (let entry of usrNameArr) {
        const newEntry = new FListEntry();
        newEntry.info = entry;
        newEntry.key = 'DU_' + counter.toString();
        resultArr.push(newEntry);
        counter++;
      }
      setUsrList(resultArr);
    } catch (err) {
      Alert.alert(
        'Error',
        `There was a problem generating the user list: ${err}`
      );
    }
  };

  // no need to rerender list as we navigate away from this component on successful deletion
  useEffect(() => {
    // IIFE
    (async () => {
      await genUsers();
      setIsLoading(false);
    })();
  }, []);

  // don't render until loading is finished
  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[dynamicSty.fListContainer, staticSty.fListContainer]}>
        <View style={styles.textHeaderContainer}>
          <Text style={[dynamicSty.textHeader, staticSty.textHeader]}>
            SELECT USERS FOR REMOVAL
          </Text>
        </View>
        <FlatList
          data={usrList}
          style={styles.fList}
          renderItem={({ item }) => (
            <View style={styles.listEntryContainer}>
              <Pressable
                onPress={() => {
                  reverse(item.info);
                }}
                style={[
                  dynamicSty.smButton,
                  staticSty.smButton,
                  {
                    backgroundColor:
                      checkForUsr(item.info) === -1 ? 'white' : 'black',
                  },
                ]}
              >
                <Text style={[dynamicSty.smButtonTxt, staticSty.smButtonTxt]}>
                  X
                </Text>
              </Pressable>

              <Text style={[dynamicSty.orgText, staticSty.orgText]}>
                {shorten(item.info)}
              </Text>
            </View>
          )}
        />
      </View>
      <View style={styles.buttonContainer}>
        <RoundButton
          onPressFunc={() => deleteEntries()}
          label={'delete'}
        ></RoundButton>
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
  fListContainer: {
    flex: 1,
    backgroundColor: 'white',
    width: '90%',
    borderColor: 'black',
  },
  fList: {
    width: '100%',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  listEntryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  textHeaderContainer: {
    width: '100%',
    alignItems: 'center',
  },
  textHeader: {
    color: '#808080',
    fontStyle: 'italic',
  },
  orgText: {
    color: 'black',
  },
  smButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'black',
  },
  smButtonTxt: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
});
