import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // 검색 아이콘을 추가로 import합니다.
import serverHost from './host';

import { useNavigation, useFocusEffect } from '@react-navigation/native';

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [topSearchKeywords, setTopSearchKeywords] = useState([]); // 추가된 부분
  const [userId, setUserId] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const navigation = useNavigation();
  const [hoveredItemId, setHoveredItemId] = useState(null); // Hover state for recent items
  const [hoveredKeywordIndex, setHoveredKeywordIndex] = useState(null); // Hover state for top keywords

  useFocusEffect(
    useCallback(() => {
      fetchSearchKeywords();
      fetchTopSearchKeywords(); // 최근 검색어와 함께 가장 많이 검색된 검색어도 가져오기
    }, [fetchSearchKeywords, fetchTopSearchKeywords]) // fetchTopSearchKeywords 추가
  );

  // 현재 로그인된 사용자의 ID를 가져오는 함수
  const fetchUserId = useCallback(async () => {
    const userId = await AsyncStorage.getItem('userId');
    setUserId(userId);
  }, []);

  const saveSearchTerm = async (searchTerm) => {
    try {
      const response = await fetch(`${serverHost}:4000/searchHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchTerm, userId })
      });
      if (!response.ok) {
        console.error('검색어 저장 오류:', response.status);
      } else {
        // 검색어 저장 후 최근 검색어 다시 불러오기
        fetchSearchKeywords();
      }
    } catch (error) {
      console.error('검색어 저장 오류:', error);
    }
  };

  // 검색어 목록을 서버로부터 가져오는 함수
  const fetchSearchKeywords = useCallback(async () => {
    try {
      const response = await fetch(`${serverHost}:4000/searchKeywords/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSearchKeywords(data);
      } else {

      }
    } catch (error) {
      console.error('검색어를 가져오는 중 오류가 발생했습니다:', error);
    }
  }, [userId]);

  // 가장 많이 검색된 검색어를 서버로부터 가져오는 함수
  const fetchTopSearchKeywords = useCallback(async () => {
    try {
      const response = await fetch(`${serverHost}:4000/topSearchKeywords`);
      if (response.ok) {
        const data = await response.json();
        setTopSearchKeywords(data);
      }
    } catch (error) {
      console.error('가장 많이 검색된 검색어를 가져오는 중 오류가 발생했습니다:', error);
    }
  }, []);

  // 검색 버튼 클릭 시 검색 결과를 가져오는 함수
  const handleSearch = async () => {
    try {
      // 검색어가 비어 있는지 확인
      if (!searchTerm.trim()) {
        // console.error('검색어를 입력하세요.');
        return;
      }

      // 서버로 검색어를 포함한 GET 요청 보내기
      const response = await fetch(`${serverHost}:4000/products?search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const searchResults = await response.json();
        // 검색 결과를 SearchResults 컴포넌트로 전달
        saveSearchTerm(searchTerm);
        setSavedSearchTerm(searchTerm);
        navigation.navigate('SearchResults', { searchResults, searchTerm });
        console.log('검색 결과:', searchResults);
        // 검색어 저장

      } else {
        // 검색 오류 처리
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      // 검색 오류 처리
      console.error('검색 오류:', error);
    }
  };


  // 검색어 삭제 함수
  const deleteKeyword = async (keywordId) => {
    try {
      const response = await fetch(`${serverHost}:4000/searchKeywords/delete/${keywordId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchSearchKeywords(); // 삭제 후 목록을 다시 가져옴
      } else {
        console.error('검색어 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('검색어를 삭제하는 중 오류가 발생했습니다:', error);
    }
  };

  // 컴포넌트가 마운트되면 사용자 ID와 검색어 목록을 가져옴
  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  useEffect(() => {
    if (userId !== '') {
      fetchSearchKeywords();
      fetchTopSearchKeywords(); // 최근 검색어와 함께 가장 많이 검색된 검색어도 가져오기
    }
  }, [userId, fetchSearchKeywords, fetchTopSearchKeywords]);

  // 검색어를 누르면 해당 검색어로 검색되도록 하는 함수
  const searchWithKeyword = async (keyword) => {
    setSearchTerm(keyword);
    handleSearch();
  };

  return (
    <View style={styles.container}>
      {/* 검색 바 */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="검색어를 입력하세요"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="#103260" />
        </TouchableOpacity>
      </View>

      {/* 가장 많이 검색된 검색어 */}
      <View style={styles.topKeywordsContainer}>
        <Text style={styles.sectionTitle}>가장 많이 검색된 검색어</Text>
        <ScrollView horizontal style={styles.topKeywords}>
          {topSearchKeywords.map((keyword, index) => (
             <TouchableOpacity
             key={index}
             style={[
               styles.keywordItem,
               { backgroundColor: hoveredKeywordIndex === index ? '#d3d3d3' : '#f0f0f0' }
             ]}
             onPress={() => searchWithKeyword(keyword.search_term)}
             onPressIn={() => setHoveredKeywordIndex(index)}
             onPressOut={() => setHoveredKeywordIndex(null)}
           >
              <Text style={styles.keywordText}>{keyword.search_term}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 최근 검색어 */}
      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>최근 검색어</Text>
        <ScrollView style={styles.recentSearches}>
          {searchKeywords.map((keyword) => (
              <TouchableOpacity
              key={keyword.id}
              style={[
                styles.recentItem,
                { backgroundColor: hoveredItemId === keyword.id ? '#d3d3d3' : '#f0f0f0' }
              ]}
              onPress={() => searchWithKeyword(keyword.search_term)}
              onPressIn={() => setHoveredItemId(keyword.id)}
              onPressOut={() => setHoveredItemId(null)}
            >
              <Text style={styles.recentText}>{keyword.search_term}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteKeyword(keyword.id)}>
              <Ionicons name="close-sharp" size={20} color="#103260" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
  },
  searchButton: {
    borderRadius: 10,
    padding: 10,
    marginLeft: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  topKeywordsContainer: {
    marginTop: 20,
    marginBottom: 20, // 최근 검색어와의 간격 조정
  },
  topKeywords: {
    flexDirection: 'row', // 가로로 한 줄로 정렬
    marginBottom: 10, // 검색어 아래 여백 추가
    
  },
  keywordItem: {
    marginRight: 10,
    padding: 5,
    backgroundColor: '#f0f0f0',
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row', // 텍스트들이 가로로 정렬되도록 변경
    overflow: 'hidden',
    borderWidth: 1, // 테두리 두께 추가
    borderColor: '#ccc', // 테두리 색상 추가
  },

  keywordText: {
    fontSize: 14,

  },
  recentContainer: {
    marginBottom: 20, // 검색 버튼 아래 여백 추가
  },
  recentSearches: {
    marginRight: 20,
    // overflow: 'hidden',
  },
  recentItem: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    width: 'auto',
    height: 40,
    borderRadius: 15,
    borderWidth: 0.5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10, // 검색어 아래 여백 추가
    backgroundColor: '#f0f0f0', // 최근 검색어 배경색 추가
  },
  recentText: {
    marginRight: 5,
  },
 
});

export default SearchPage;
