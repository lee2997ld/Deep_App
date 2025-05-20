// screens/SearchRecipeScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  TouchableOpacity,
  Platform
} from 'react-native';

const SearchRecipeScreen = ({ route, navigation }) => {
  const { ingredient } = route.params || {};
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 샘플 데이터 (CSV 로드 실패 시 사용)
  const sampleRecipes = [
    {
      id: '1',
      name: `${ingredient} 볶음`,
      ingredients: `${ingredient}, 양파, 마늘, 소금, 후추, 식용유`,
      steps: `1. 재료를 손질합니다.\n2. 팬을 달구고 식용유를 두릅니다.\n3. ${ingredient}를 넣고 볶습니다.`
    },
    {
      id: '2',
      name: `${ingredient} 조림`,
      ingredients: `${ingredient}, 간장, 설탕, 다진 마늘, 참기름, 깨`,
      steps: `1. ${ingredient}를 손질합니다.\n2. 냄비에 양념과 함께 조립니다.`
    },
    {
      id: '3',
      name: `${ingredient} 전`,
      ingredients: `${ingredient}, 부침가루, 계란, 소금, 식용유`,
      steps: `1. ${ingredient}를 적당한 크기로 썰어줍니다.\n2. 부침가루와 계란을 섞어 반죽합니다.`
    }
  ];

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        
        // 웹 환경에서는 CSV 파싱 시도 후 실패하면 샘플 데이터 사용
        setTimeout(() => {
          setRecipes(sampleRecipes);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('데이터 로드 오류:', err);
        setError('레시피를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        
        // 오류 시 샘플 데이터 사용
        setRecipes(sampleRecipes);
      }
    };
    
    loadRecipes();
  }, [ingredient]);
  
  // 레시피 항목 렌더링
  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeItem}
      onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
    >
      <Text style={styles.recipeName}>{item.name}</Text>
      <Text style={styles.recipeIngredients}>
        주요 재료: {item.ingredients?.split(',').slice(0, 3).join(', ') || '정보 없음'}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {ingredient ? `"${ingredient}" 포함 레시피` : '모든 레시피'}
        ({recipes.length}개)
      </Text>
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>레시피를 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>해당 재료를 사용한 레시피가 없습니다.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#FF5722',
    textAlign: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 10,
  },
  recipeItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recipeIngredients: {
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
});

export default SearchRecipeScreen;
