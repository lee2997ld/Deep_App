import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 임시 저장 레시피 데이터
const sampleSavedRecipes = [
  { 
    id: '1', 
    title: '김치찌개',
    mainIngredient: '김치', 
    time: '30분',
    difficulty: '쉬움'
  },
  { 
    id: '2', 
    title: '된장찌개',
    mainIngredient: '된장', 
    time: '25분',
    difficulty: '쉬움'
  },
  { 
    id: '3', 
    title: '불고기',
    mainIngredient: '소고기', 
    time: '40분',
    difficulty: '보통'
  },
  { 
    id: '4', 
    title: '비빔밥',
    mainIngredient: '야채, 고기', 
    time: '35분',
    difficulty: '보통'
  },
];

const SavedScreen = ({ navigation }) => {
  // 아직 저장한 레시피가 없는 경우
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>저장한 레시피가 없습니다.</Text>
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => navigation.navigate('Search')}
      >
        <Text style={styles.searchButtonText}>레시피 찾아보기</Text>
      </TouchableOpacity>
    </View>
  );

  // 레시피 항목 렌더링
  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeItem}
      onPress={() => navigation.navigate('RecipeDetail', { recipeName: item.title })}
    >
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeDetail}>주 재료: {item.mainIngredient}</Text>
        <View style={styles.recipeMetaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>저장된 레시피</Text>
      </View>
      
      <FlatList
        data={sampleSavedRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  recipeItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  recipeDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recipeMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  }
});

export default SavedScreen;
