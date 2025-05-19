import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  // 추천 요리 리스트
  const recommendedRecipes = [
    {
      id: '1',
      title: '김치찌개',
      ingredients: '김치, 돼지고기, 두부, 파',
      time: '30분',
      difficulty: '쉬움',
    },
    {
      id: '2',
      title: '계란 볶음밥',
      ingredients: '계란, 밥, 양파, 당근',
      time: '15분',
      difficulty: '쉬움',
    },
    {
      id: '3',
      title: '된장찌개',
      ingredients: '된장, 두부, 감자, 양파, 파',
      time: '25분',
      difficulty: '쉬움',
    },
    {
      id: '4',
      title: '시금치 무침',
      ingredients: '시금치, 마늘, 참기름',
      time: '10분',
      difficulty: '쉬움',
    }
  ];

  // 인기 식재료
  const popularIngredients = [
    { id: '1', name: '소고기', icon: 'nutrition-outline' },
    { id: '2', name: '계란', icon: 'egg-outline' },
    { id: '3', name: '양파', icon: 'leaf-outline' },
    { id: '4', name: '김치', icon: 'restaurant-outline' },
    { id: '5', name: '감자', icon: 'leaf-outline' }
  ];

  // 레시피 아이템 렌더링
  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail', { recipeName: item.title })}
    >
      <View style={styles.recipePlaceholder}>
        <Ionicons name="restaurant-outline" size={24} color="#ccc" />
      </View>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeIngredients} numberOfLines={1}>{item.ingredients}</Text>
        <View style={styles.recipeMetaInfo}>
          <Text style={styles.recipeTime}>{item.time}</Text>
          <Text style={styles.recipeDifficulty}>난이도: {item.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 인기 식재료 아이템 렌더링
  const renderIngredientItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.ingredientItem}
      onPress={() => navigation.navigate('Search')}
    >
      <View style={styles.ingredientIconContainer}>
        <Ionicons name={item.icon} size={24} color="#FFA500" />
      </View>
      <Text style={styles.ingredientName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>DEEP_APP</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="person-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="menu-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {/* 메인 카드 영역 */}
        <View style={styles.mainCard}>
          <Text style={styles.mainTitle}>쉽고 간편하게{'\n'}집에서 해먹는 집밥!</Text>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="camera-outline" size={20} color="#333" />
            <Text style={styles.searchButtonText}>식재료 인식하러 가기</Text>
          </TouchableOpacity>
        </View>
        
        {/* 인기 식재료 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기 식재료</Text>
          <FlatList
            data={popularIngredients}
            renderItem={renderIngredientItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.ingredientsList}
          />
        </View>
        
        {/* 추천 레시피 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘의 추천!</Text>
          <View style={styles.recipeList}>
            {recommendedRecipes.map(recipe => (
              <View key={recipe.id}>
                {renderRecipeItem({item: recipe})}
              </View>
            ))}
          </View>
        </View>
        
        {/* 하단 여백 추가 (탭 바 높이만큼) */}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  mainCard: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    margin: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  ingredientsList: {
    marginBottom: 10,
  },
  ingredientItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  ingredientIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  ingredientName: {
    fontSize: 14,
    color: '#333',
  },
  recipeList: {
    marginTop: 5,
  },
  recipeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  recipePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeInfo: {
    padding: 15,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recipeIngredients: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recipeMetaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recipeTime: {
    fontSize: 14,
    color: '#FFA500',
  },
  recipeDifficulty: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
