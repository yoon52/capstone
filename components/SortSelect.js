import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

function SortSelect({ sortType, handleSortChange }) {
  return (
    <View style={styles.sortContainer}>
      {/* 정렬 기준을 선택하는 드롭다운 메뉴 */}
      <Text style={styles.sortType}>정렬 기준  :</Text>
      {/* 드롭다운 메뉴에서 선택한 값이 변경될 때 handleSortChange 함수 호출 */}
      <Picker
        selectedValue={sortType}
        onValueChange={(itemValue) => handleSortChange(itemValue)}
        style={[styles.picker]}
        mode="dropdown"
      >
        {/* 추천순과 최신순 옵션 제공 */}
        <Picker.Item label="추천순" value="recommend" style={styles.pick} />
        <Picker.Item label="최신순" value="latest" style={styles.pick} />
        <Picker.Item label="조회수순" value="views" style={styles.pick} />
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  sortType: {
    fontSize: 15,
    marginStart: 10,
  },
  sortContainer: {
  },
  picker: {
    flex: 1,
    marginTop: -36,
    marginStart: 75,
    marginEnd: 160,
  },
  pick: {
    fontSize: 15,
    color: '#000000',
  },
});

export default SortSelect;