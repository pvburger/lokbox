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
import { removeData, getSingleData } from '../util/database';
import { DBEntryColObj, FListEntry } from '../types';

export default function Remove({ changePage, userControl, widget }) {
  const [orgList, setOrgList] = useState<FListEntry[]>([]);
  const [selections, setSelections] = useState<DBEntryColObj[]>([]);
  const [orgObjArr, setOrgObjArr] = useState<DBEntryColObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // shorten org name if greater than 20 characters
  const shorten = (inp: string): string => {
    if (inp.length > 20) {
      return inp.slice(0, 20) + '...';
    } else {
      return inp;
    }
  };

  // check if orgName occurs within an object in selections
  // returns index of entry if selections state variable contains entry with specified orgName
  // or -1 if there is no such entry
  const checkForOrg = (orgName: string): number => {
    for (let i = 0; i < selections.length; i++) {
      if (selections[i].data_val === orgName) {
        return i;
      }
    }
    return -1;
  };

  // modify button on select and add/remove entry to/from 'selections' state variable
  const reverse = (orgName: string): void => {
    try {
      const orgNameIdx = checkForOrg(orgName);

      if (orgNameIdx !== -1) {
        // remove entry from selections
        setSelections([
          ...selections.slice(0, orgNameIdx),
          ...selections.slice(orgNameIdx + 1),
        ]);
      } else {
        // add entry to selections
        const tempArr: DBEntryColObj[] = [...selections];

        // get associated entry from orgObjArr
        // there should only be one object that meets the criteria, hence the [0] index
        const orgObj = orgObjArr.filter((el) => {
          if (el.data_val === orgName) {
            return el;
          }
        })[0];

        tempArr.push({
          data_id: orgObj.data_id,
          data_val: orgObj.data_val,
        });

        setSelections(tempArr);
      }
    } catch (err) {
      throw new Error(`There was a problem changing selection: ${err}`);
    }
  };

  const deleteEntries = async (): Promise<void> => {
    try {
      await removeData(selections);
      Alert.alert('Success', 'Selected entries removed from database');
      setSelections([]);
    } catch (err) {
      Alert.alert(`There was a problem deleting database entries: ${err}`);
      // CLEANUP - HOW TO HANDLE
      changePage(3);
    }
  };

  // populates orgList (to populate Flat List) and orgObjArr
  const genOrgs = async (): Promise<void> => {
    try {
      // get array of objects w/ data_id and data_org for user from database
      const usrOrgObjArr = await getSingleData(
        userControl.get(),
        'data_org',
        widget
      );

      // throw error if there is no data in the database
      if (usrOrgObjArr.length === 0) {
        throw new Error(`User has no data to delete`);
      }

      const resultArr: FListEntry[] = [];
      let counter = 1;

      for (let entry of usrOrgObjArr) {
        // data_val will never be a number in this case, but TS can't determine that, hence the type coersion
        // additionaly, React-Native expects the key value as a string
        resultArr.push({
          orgName: entry.data_val.toString(),
          key: counter.toString(),
        });
        counter++;
      }

      setIsLoading(true);
      setOrgObjArr(usrOrgObjArr);
      setOrgList(resultArr);
    } catch (err) {
      Alert.alert('Error', `${err}`);
      changePage(3);
    }
  };

  useEffect(() => {
    // added for development
    // console.log('useEffect invoked...');

    // ***** THIS IS AN IIFE (IMMEDIATELY INVOKED FUNCTION) *****
    // it is used, in this case, to allow async/await syntax inside of useEffect
    // the other option is to use promise chaining
    (async () => {
      await genOrgs();
      setIsLoading(false);
    })();
  }, [selections]);

  /*
  don't render until loading is finished
  in addition to ensuring UI doesn't render until all state is assinged, this prevents 
  deleteEntries from being invoked for a second time before the first instance has
  concluded
  */
  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.fListContainer}>
        <View style={styles.textHeaderContainer}>
          <Text style={styles.textHeader}>SELECT ENTRIES FOR REMOVAL</Text>
        </View>
        <FlatList
          data={orgList}
          renderItem={({ item }) => (
            <View style={styles.listEntryContainer}>
              <Pressable
                onPress={() => {
                  reverse(item.orgName);
                }}
                style={[
                  styles.smBtn,
                  {
                    backgroundColor:
                      checkForOrg(item.orgName) === -1 ? 'white' : 'black',
                  },
                ]}
              >
                <Text style={styles.smBtnTxt}>X</Text>
              </Pressable>

              <Text style={styles.orgText}>{shorten(item.orgName)}</Text>
            </View>
          )}
        />
      </View>
      <View style={styles.buttonContainer}>
        <RoundButton
          onPressFunc={() => deleteEntries()}
          label={'delete'}
        ></RoundButton>
        <RoundButton
          onPressFunc={() => changePage(3)}
          label={'menu'}
        ></RoundButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  fListContainer: {
    backgroundColor: 'white',
    width: '90%',
    height: '82%',
    margin: 25,
    borderRadius: 25,
    borderColor: 'black',
    borderWidth: 4,
    elevation: 5,
  },
  listEntryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textHeaderContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textHeader: {
    color: '#808080',
    fontSize: 22,
    fontStyle: 'italic',
    margin: 10,
  },
  orgText: {
    color: 'black',
    fontSize: 32,
  },
  smBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 15,
    borderColor: 'black',
    borderWidth: 4,
    elevation: 5,
  },
  smBtnTxt: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
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
