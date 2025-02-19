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
import { DBEntryColObj, FListEntry, Props } from '../types';
import { useModContext } from '../context/global';

export default function Remove({ changePage, userControl, widget }: Props) {
  const [orgList, setOrgList] = useState<FListEntry[]>([]);
  const [selections, setSelections] = useState<DBEntryColObj[]>([]);
  const [orgObjArr, setOrgObjArr] = useState<DBEntryColObj[]>([]);
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

  // shorten org name if greater than 13 characters
  const shorten = (inp: string): string => {
    if (inp.length > 16) {
      return inp.slice(0, 16) + '...';
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
      changePage!(3);
    }
  };

  // populates orgList (to populate Flat List) and orgObjArr
  const genOrgs = async (): Promise<void> => {
    try {
      // get array of objects w/ data_id and data_org for user from database
      const usrOrgObjArr = await getSingleData(
        userControl!.get(),
        'data_org',
        widget!
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
      changePage!(3);
    }
  };

  useEffect(() => {

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
      <View style={[dynamicSty.fListContainer, staticSty.fListContainer]}>
        <View style={styles.textHeaderContainer}>
          <Text style={[dynamicSty.textHeader, staticSty.textHeader]}>
            SELECT ENTRIES FOR REMOVAL
          </Text>
        </View>
        <FlatList
          data={orgList}
          style={styles.fList}
          renderItem={({ item }) => (
            <View style={styles.listEntryContainer}>
              <Pressable
                onPress={() => {
                  reverse(item.orgName);
                }}
                style={[
                  dynamicSty.smButton,
                  staticSty.smButton,
                  {
                    backgroundColor:
                      checkForOrg(item.orgName) === -1 ? 'white' : 'black',
                  },
                ]}
              >
                <Text style={[dynamicSty.smButtonTxt, staticSty.smButtonTxt]}>
                  X
                </Text>
              </Pressable>

              <Text style={[dynamicSty.orgText, staticSty.orgText]}>
                {shorten(item.orgName)}
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
