import { StyleSheet, Text, View, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThinButton } from '../elements/buttons';
import { getSingleData, getDBEntry } from '../util/database';
import { FListEntry, Props } from '../types';
import { useModContext } from '../context/global';
import { modUtf16Sort } from '../util/general';

export default function UpdateList({
  changePage,
  userControl,
  widget,
  entryControl,
}: Props) {
  const [orgList, setOrgList] = useState<FListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // bring in global context
  const globalObj = useModContext();
  const scrH = globalObj.data.dimensions.scr_H;

  // dynamic styleheet
  const dynamicSty = StyleSheet.create({
    fListContainer: {
      marginVertical: 0.02 * scrH,
      borderRadius: 0.02 * scrH,
      borderWidth: 0.0035 * scrH,
      elevation: 0.005 * scrH,
    },
    textHeader: {
      fontSize: 0.018 * scrH,
      marginTop: 0.02 * scrH,
      marginBottom: 0.01 * scrH,
    },
  });
  const staticSty = styles;

  // shorten org name if greater than 16 characters
  const shorten = (inp: string): string => {
    if (inp.length > 16) {
      return inp.slice(0, 16) + '...';
    } else {
      return inp;
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

      // map usrOrgObjArr to simple orgNameArr for sorting
      let orgNameArr = usrOrgObjArr.map((el) => el.data_val.toString());
      orgNameArr = modUtf16Sort(orgNameArr);

      const resultArr: FListEntry[] = [];
      let counter = 1;

      for (let entry of orgNameArr) {
        // data_val will never be a number in this case, but TS can't determine that, hence the type coersion
        // additionaly, React-Native expects the key value as a string
        resultArr.push({
          info: entry,
          key: 'UL_' + counter.toString(),
        });
        counter++;
      }

      setIsLoading(true);
      setOrgList(resultArr);
    } catch (err) {
      Alert.alert('Error', `There was a problem retrieving org list: ${err}`);
      changePage!(3);
    }
  };

  const getData = async (dataOrg: string): Promise<void> => {
    try {
      const result = await getDBEntry(userControl!.get(), widget!, dataOrg);
      entryControl!.set(result);
      changePage!(12);
    } catch (err) {
      Alert.alert(
        'Error',
        `There was a problem retrieving database entry: ${err}`
      );
      throw err;
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
            SELECT ENTRY TO UPDATE
          </Text>
        </View>
        <FlatList
          data={orgList}
          style={styles.fList}
          renderItem={({ item }) => (
            <View style={styles.listEntryContainer}>
              <ThinButton
                onPressFunc={() => {
                  getData(item.info);
                }}
                label={shorten(item.info)}
              />
            </View>
          )}
        />
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
    alignItems: 'center',
  },
  fList: {
    width: '100%',
  },
  listEntryContainer: {
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  textHeaderContainer: {
    width: '100%',
    alignItems: 'center',
    // added for development
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  textHeader: {
    color: '#808080',
    fontStyle: 'italic',
  },
});
