import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';

// 조건부 import - 웹에서는 expo-sqlite를 import하지 않음
let SQLite, FileSystem;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
  FileSystem = require('expo-file-system');
}

const SearchRecipeScreen = ({ route, navigation }) => {
  // ResultScreen에서 전달받은 인식된 재료들
  const { recognizedIngredients = [] } = route.params || {};
  
  // 디버깅용 콘솔 로그 추가
  useEffect(() => {
    console.log('=== SearchRecipeScreen 디버깅 ===');
    console.log('전체 route.params:', route.params);
    console.log('받은 recognizedIngredients:', recognizedIngredients);
    console.log('recognizedIngredients 타입:', typeof recognizedIngredients);
    console.log('recognizedIngredients 길이:', recognizedIngredients.length);
    console.log('================================');
  }, [route.params, recognizedIngredients]);
  
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbConnectionStatus, setDbConnectionStatus] = useState(null);
  const [searchResult, setSearchResult] = useState(null);

  // 웹용 SQLite 초기화 - 개선된 버전
  const initWebDatabase = async () => {
    try {
      setDbConnectionStatus('SQL.js 라이브러리 로드 중...');
      
      // SQL.js 라이브러리 초기화
      if (typeof window !== 'undefined' && !window.SQL) {
        const initSqlJs = require('sql.js');
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });
        window.SQL = SQL;
      }

      let db;
      
      try {
        setDbConnectionStatus('기존 DB 파일 로드 시도 중...');
        
        // XMLHttpRequest를 사용한 더 안정적인 파일 로드
        const loadDatabase = () => {
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            // 여러 가능한 경로 시도
            const possiblePaths = [
              '/recipes.db',
              './recipes.db',
              '/assets/recipes.db',
              './assets/recipes.db',
              '/public/recipes.db'
            ];
            
            let currentPathIndex = 0;
            
            const tryNextPath = () => {
              if (currentPathIndex >= possiblePaths.length) {
                reject(new Error('모든 경로에서 DB 파일을 찾을 수 없습니다'));
                return;
              }
              
              const currentPath = possiblePaths[currentPathIndex];
              console.log(`DB 파일 로드 시도: ${currentPath}`);
              
              xhr.open('GET', currentPath, true);
              xhr.responseType = 'arraybuffer';
              
              xhr.onload = () => {
                if (xhr.status === 200) {
                  try {
                    const uInt8Array = new Uint8Array(xhr.response);
                    
                    // 파일이 비어있지 않은지 확인
                    if (uInt8Array.length === 0) {
                      console.log(`${currentPath}: 파일이 비어있음`);
                      currentPathIndex++;
                      tryNextPath();
                      return;
                    }
                    
                    // SQLite 파일 헤더 확인 (SQLite 파일은 "SQLite format 3"로 시작)
                    const header = new TextDecoder().decode(uInt8Array.slice(0, 16));
                    if (!header.startsWith('SQLite format 3')) {
                      console.log(`${currentPath}: 유효하지 않은 SQLite 파일 형식`);
                      currentPathIndex++;
                      tryNextPath();
                      return;
                    }
                    
                    const database = new window.SQL.Database(uInt8Array);
                    console.log(`${currentPath}: DB 파일 로드 성공`);
                    resolve(database);
                  } catch (error) {
                    console.log(`${currentPath}: DB 파일 파싱 오류 - ${error.message}`);
                    currentPathIndex++;
                    tryNextPath();
                  }
                } else {
                  console.log(`${currentPath}: HTTP ${xhr.status} 오류`);
                  currentPathIndex++;
                  tryNextPath();
                }
              };
              
              xhr.onerror = () => {
                console.log(`${currentPath}: 네트워크 오류`);
                currentPathIndex++;
                tryNextPath();
              };
              
              xhr.send();
            };
            
            tryNextPath();
          });
        };

        db = await loadDatabase();
        console.log('웹에서 기존 DB 파일 로드 성공');
        
      } catch (fetchError) {
        console.log('기존 DB 파일 로드 실패:', fetchError.message);
        throw new Error(`DB 파일을 찾을 수 없습니다: ${fetchError.message}`);
      }

      // 테이블 구조 확인 및 검증
      const tables = db.exec(`
        SELECT name FROM sqlite_master WHERE type='table'
      `);
      
      console.log('웹 DB 테이블 목록:', tables);
      
      // 필요한 테이블들이 존재하는지 확인
      const tableNames = tables[0] ? tables[0].values.map(row => row[0]) : [];
      const hasRecipesTable = tableNames.includes('recipes');
      const hasIngredientsTable = tableNames.includes('ingredients');
      const hasStepsTable = tableNames.includes('steps');

      if (!hasRecipesTable) {
        throw new Error('recipes 테이블이 존재하지 않습니다. DB 파일을 확인해주세요.');
      }

      // 레코드 수 확인
      const recipeCountResult = db.exec('SELECT COUNT(*) as count FROM recipes');
      const recipeCount = recipeCountResult[0] ? recipeCountResult[0].values[0][0] : 0;
      
      let ingredientCount = 0;
      let stepCount = 0;
      
      if (hasIngredientsTable) {
        const ingredientCountResult = db.exec('SELECT COUNT(*) as count FROM ingredients');
        ingredientCount = ingredientCountResult[0] ? ingredientCountResult[0].values[0][0] : 0;
      }
      
      if (hasStepsTable) {
        const stepCountResult = db.exec('SELECT COUNT(*) as count FROM steps');
        stepCount = stepCountResult[0] ? stepCountResult[0].values[0][0] : 0;
      }

      setDbConnectionStatus(
        `웹 DB 연결 성공 (레시피: ${recipeCount}, 재료: ${ingredientCount}, 단계: ${stepCount})`
      );

      // 기존 데이터 샘플 출력 (디버깅용)
      const sampleRecipesResult = db.exec('SELECT * FROM recipes LIMIT 3');
      if (sampleRecipesResult[0]) {
        console.log('웹 레시피 샘플:', sampleRecipesResult[0]);
      }

      return db;
      
    } catch (error) {
      console.error('웹 데이터베이스 초기화 오류:', error);
      setDbConnectionStatus(`웹 DB 연결 실패: ${error.message}`);
      throw error;
    }
  };

  // 모바일용 데이터베이스 초기화 - 기존 recipes.db 파일 사용
  const initMobileDatabase = async () => {
    try {
      setDbConnectionStatus('기존 DB 파일 연결 시도 중...');
      
      if (!SQLite) {
        throw new Error('SQLite not available on this platform');
      }
      
      // 기존 recipes.db 파일 사용
      const dbName = 'recipes.db';
      const db = await SQLite.openDatabaseAsync(dbName);
      
      // 기존 테이블 구조 확인
      const tables = await db.getAllAsync(`
        SELECT name FROM sqlite_master WHERE type='table'
      `);
      console.log('기존 테이블 목록:', tables);
      
      // recipes 테이블이 있는지 확인
      const hasRecipesTable = tables.some(table => table.name === 'recipes');
      if (!hasRecipesTable) {
        throw new Error('recipes 테이블이 존재하지 않습니다.');
      }
      
      // ingredients 테이블이 있는지 확인
      const hasIngredientsTable = tables.some(table => table.name === 'ingredients');
      
      // steps 테이블이 있는지 확인  
      const hasStepsTable = tables.some(table => table.name === 'steps');
      
      // 레코드 수 확인
      const recipeCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM recipes');
      let ingredientCount = 0;
      let stepCount = 0;
      
      if (hasIngredientsTable) {
        const ingredientResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM ingredients');
        ingredientCount = ingredientResult.count;
      }
      
      if (hasStepsTable) {
        const stepResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM steps');
        stepCount = stepResult.count;
      }
      
      setDbConnectionStatus(
        `기존 DB 연결 성공 (레시피: ${recipeCount.count}, 재료: ${ingredientCount}, 단계: ${stepCount})`
      );
      
      // 기존 데이터 샘플 출력 (디버깅용)
      const sampleRecipes = await db.getAllAsync('SELECT * FROM recipes LIMIT 3');
      console.log('기존 레시피 샘플:', sampleRecipes);
      
      if (hasIngredientsTable) {
        const sampleIngredients = await db.getAllAsync('SELECT * FROM ingredients LIMIT 5');
        console.log('기존 재료 샘플:', sampleIngredients);
      }
      
      return db;
    } catch (error) {
      console.error('모바일 데이터베이스 초기화 오류:', error);
      setDbConnectionStatus(`기존 DB 연결 실패: ${error.message}`);
      throw error;
    }
  };

  // 웹용 레시피 상세 정보 가져오기 - 개선된 버전
  const getRecipeDetailWeb = async (recipeId) => {
    try {
      const db = await initWebDatabase();
      
      // 레시피 기본 정보
      const recipeResult = db.exec(`
        SELECT * FROM recipes WHERE id = ${recipeId}
      `);
      
      if (!recipeResult[0] || recipeResult[0].values.length === 0) {
        throw new Error('레시피를 찾을 수 없습니다.');
      }
      
      const recipeData = {};
      recipeResult[0].columns.forEach((col, index) => {
        recipeData[col] = recipeResult[0].values[0][index];
      });
      
      // 재료 정보 (안전하게 처리)
      let ingredients = [];
      try {
        const ingredientsResult = db.exec(`
          SELECT ingredient FROM ingredients WHERE recipe_id = ${recipeId}
        `);
        ingredients = ingredientsResult[0] ? 
          ingredientsResult[0].values.map(row => row[0]) : [];
      } catch (ingredientError) {
        console.log('재료 정보 로드 실패:', ingredientError.message);
      }
      
      // 조리 단계 (안전하게 처리)
      let steps = [];
      try {
        const stepsResult = db.exec(`
          SELECT step_order, description FROM steps 
          WHERE recipe_id = ${recipeId} 
          ORDER BY step_order
        `);
        steps = stepsResult[0] ? 
          stepsResult[0].values.map(row => ({
            order: row[0],
            description: row[1]
          })) : [];
      } catch (stepError) {
        console.log('조리 단계 정보 로드 실패:', stepError.message);
      }
      
      return {
        ...recipeData,
        ingredients,
        steps
      };
      
    } catch (error) {
      console.error('웹 레시피 상세 정보 오류:', error);
      throw error;
    }
  };

  // 모바일용 레시피 상세 정보 가져오기
  const getRecipeDetailMobile = async (recipeId) => {
    try {
      const db = await initMobileDatabase();
      
      // 레시피 기본 정보
      const recipe = await db.getFirstAsync(`
        SELECT * FROM recipes WHERE id = ?
      `, [recipeId]);
      
      if (!recipe) {
        throw new Error('레시피를 찾을 수 없습니다.');
      }
      
      // 재료 정보
      const ingredients = await db.getAllAsync(`
        SELECT ingredient FROM ingredients WHERE recipe_id = ?
      `, [recipeId]);
      
      // 조리 단계
      const steps = await db.getAllAsync(`
        SELECT step_order, description FROM steps 
        WHERE recipe_id = ? 
        ORDER BY step_order
      `, [recipeId]);
      
      return {
        ...recipe,
        ingredients: ingredients.map(row => row.ingredient),
        steps: steps.map(row => ({
          order: row.step_order,
          description: row.description
        }))
      };
      
    } catch (error) {
      console.error('모바일 레시피 상세 정보 오류:', error);
      throw error;
    }
  };

  // 레시피 상세 정보를 표시하는 함수
  const showRecipeDetail = async (recipe) => {
    try {
      let detailData;
      if (Platform.OS === 'web') {
        detailData = await getRecipeDetailWeb(recipe.id);
      } else {
        detailData = await getRecipeDetailMobile(recipe.id);
      }
      
      // Alert로 상세 정보 표시 (또는 새로운 화면으로 네비게이션)
      const ingredientsText = detailData.ingredients.length > 0 ? 
        detailData.ingredients.join(', ') : '재료 정보 없음';
      const stepsText = detailData.steps.length > 0 ? 
        detailData.steps.map(step => `${step.order}. ${step.description}`).join('\n') : 
        '조리 단계 정보 없음';
      
      Alert.alert(
        `[메뉴명] ${detailData.title}`,
        `[재료] ${ingredientsText}\n\n[레시피]\n${stepsText}`,
        [{ text: '확인' }]
      );
      
    } catch (error) {
      Alert.alert('오류', `레시피 상세 정보를 가져올 수 없습니다: ${error.message}`);
    }
  };

  // 콘텐츠 기반 필터링 - 웹용
  const recommendRecipesByIngredientWeb = async (userIngredient, topN = 5) => {
    try {
      const db = await initWebDatabase();
      
      // 테이블 구조 확인
      const tables = db.exec(`
        SELECT name FROM sqlite_master WHERE type='table'
      `);
      const hasIngredientsTable = tables.length > 0 && 
        tables[0].values.some(row => row[0] === 'ingredients');
      
      let scored = [];
      
      if (hasIngredientsTable) {
        // ingredients 테이블이 있는 경우 - 정규화된 구조
        console.log(`웹: 재료 "${userIngredient}"로 레시피 검색 중... (정규화된 구조)`);
        
        const result = db.exec(`
          SELECT recipes.id, recipes.title, recipes.description, recipes.cookingTime, 
                 recipes.difficulty, recipes.category, GROUP_CONCAT(ingredients.ingredient) as ingreds
          FROM recipes
          LEFT JOIN ingredients ON recipes.id = ingredients.recipe_id
          WHERE ingredients.ingredient LIKE '%${userIngredient}%'
          GROUP BY recipes.id
          LIMIT ${topN}
        `);
        
        if (result[0]) {
          const columns = result[0].columns;
          const values = result[0].values;
          
          console.log(`웹 정규화된 구조 검색 결과:`, result[0]);
          
          scored = values.map(row => {
            const rowData = {};
            columns.forEach((col, index) => {
              rowData[col] = row[index];
            });
            
            return {
              score: 1,
              id: rowData.id,
              title: rowData.title,
              description: rowData.description,
              cookingTime: rowData.cookingTime,
              difficulty: rowData.difficulty,
              category: rowData.category,
              matchedIngredient: userIngredient,
              allIngredients: rowData.ingreds ? rowData.ingreds.split(',').map(i => i.trim()) : []
            };
          });
        }
        
      } else {
        // ingredients 테이블이 없는 경우 - 기존 단순 구조
        console.log(`웹: 재료 "${userIngredient}"로 레시피 검색 중... (단순 구조)`);
        
        // 테이블 컬럼 확인
        const pragmaResult = db.exec('PRAGMA table_info(recipes)');
        console.log('웹 recipes 테이블 구조:', pragmaResult);
        
        // ingredients 컬럼이 있는지 확인
        const hasIngredientsColumn = pragmaResult[0] && 
          pragmaResult[0].values.some(row => row[1] === 'ingredients');
        
        if (hasIngredientsColumn) {
          const result = db.exec(`
            SELECT * FROM recipes 
            WHERE ingredients LIKE '%${userIngredient}%'
            LIMIT ${topN}
          `);
          
          if (result[0]) {
            const columns = result[0].columns;
            const values = result[0].values;
            
            console.log(`웹 단순 구조 검색 결과:`, result[0]);
            
            scored = values.map(row => {
              const rowData = {};
              columns.forEach((col, index) => {
                rowData[col] = row[index];
              });
              
              return {
                score: 1,
                id: rowData.id,
                title: rowData.title || rowData.name,
                description: rowData.description,
                cookingTime: rowData.cookingTime,
                difficulty: rowData.difficulty,
                category: rowData.category,
                matchedIngredient: userIngredient,
                allIngredients: rowData.ingredients ? rowData.ingredients.split(',').map(i => i.trim()) : []
              };
            });
          }
        } else {
          console.log('웹: ingredients 컬럼을 찾을 수 없습니다. 전체 레시피를 반환합니다.');
          
          // 모든 레시피 반환
          const result = db.exec(`SELECT * FROM recipes LIMIT ${topN}`);
          
          if (result[0]) {
            const columns = result[0].columns;
            const values = result[0].values;
            
            console.log('웹 전체 레시피 데이터:', result[0]);
            
            scored = values.map(row => {
              const rowData = {};
              columns.forEach((col, index) => {
                rowData[col] = row[index];
              });
              
              return {
                score: 1,
                id: rowData.id,
                title: rowData.title || rowData.name || '제목 없음',
                description: rowData.description || '설명 없음',
                cookingTime: rowData.cookingTime || '시간 정보 없음',
                difficulty: rowData.difficulty || '난이도 정보 없음',
                category: rowData.category || '분류 없음',
                matchedIngredient: userIngredient,
                allIngredients: []
              };
            });
          }
        }
      }

      return scored;
    } catch (error) {
      console.error('웹 레시피 추천 오류:', error);
      throw error;
    }
  };

  // 콘텐츠 기반 필터링 - 모바일용 (기존 코드 유지)
  const recommendRecipesByIngredientMobile = async (userIngredient, topN = 5) => {
    try {
      const db = await initMobileDatabase();
      
      // 테이블 구조 확인
      const tables = await db.getAllAsync(`
        SELECT name FROM sqlite_master WHERE type='table'
      `);
      const hasIngredientsTable = tables.some(table => table.name === 'ingredients');
      
      let scored = [];
      
      if (hasIngredientsTable) {
        // ingredients 테이블이 있는 경우 - 정규화된 구조
        console.log(`재료 "${userIngredient}"로 레시피 검색 중... (정규화된 구조)`);
        
        const rows = await db.getAllAsync(`
          SELECT recipes.id, recipes.title, recipes.description, recipes.cookingTime, 
                 recipes.difficulty, recipes.category, GROUP_CONCAT(ingredients.ingredient) as ingreds
          FROM recipes
          LEFT JOIN ingredients ON recipes.id = ingredients.recipe_id
          WHERE ingredients.ingredient LIKE ?
          GROUP BY recipes.id
          LIMIT ?
        `, [`%${userIngredient}%`, topN]);
        
        console.log(`정규화된 구조 검색 결과:`, rows);
        
        scored = rows.map(row => ({
          score: 1,
          id: row.id,
          title: row.title,
          description: row.description,
          cookingTime: row.cookingTime,
          difficulty: row.difficulty,
          category: row.category,
          matchedIngredient: userIngredient,
          allIngredients: row.ingreds ? row.ingreds.split(',').map(i => i.trim()) : []
        }));
        
      } else {
        // ingredients 테이블이 없는 경우 - 기존 단순 구조
        console.log(`재료 "${userIngredient}"로 레시피 검색 중... (단순 구조)`);
        
        // 테이블 컬럼 확인
        const pragma = await db.getAllAsync('PRAGMA table_info(recipes)');
        console.log('recipes 테이블 구조:', pragma);
        
        // ingredients 컬럼이 있는지 확인
        const hasIngredientsColumn = pragma.some(col => col.name === 'ingredients');
        
        if (hasIngredientsColumn) {
          const rows = await db.getAllAsync(`
            SELECT * FROM recipes 
            WHERE ingredients LIKE ?
            LIMIT ?
          `, [`%${userIngredient}%`, topN]);
          
          console.log(`단순 구조 검색 결과:`, rows);
          
          scored = rows.map(row => ({
            score: 1,
            id: row.id,
            title: row.title || row.name,
            description: row.description,
            cookingTime: row.cookingTime,
            difficulty: row.difficulty,
            category: row.category,
            matchedIngredient: userIngredient,
            allIngredients: row.ingredients ? row.ingredients.split(',').map(i => i.trim()) : []
          }));
        } else {
          console.log('ingredients 컬럼을 찾을 수 없습니다. 전체 레시피를 반환합니다.');
          
          // 모든 컬럼에서 검색 시도
          const rows = await db.getAllAsync(`SELECT * FROM recipes LIMIT ?`, [topN]);
          console.log('전체 레시피 데이터:', rows);
          
          scored = rows.map(row => ({
            score: 1,
            id: row.id,
            title: row.title || row.name || '제목 없음',
            description: row.description || '설명 없음',
            cookingTime: row.cookingTime || '시간 정보 없음',
            difficulty: row.difficulty || '난이도 정보 없음',
            category: row.category || '분류 없음',
            matchedIngredient: userIngredient,
            allIngredients: []
          }));
        }
      }

      return scored;
    } catch (error) {
      console.error('모바일 레시피 추천 오류:', error);
      throw error;
    }
  };

  // 인식된 재료로 레시피 검색 - 기존 DB 사용
  const searchRecipesByRecognizedIngredients = useCallback(async () => {
    console.log('=== 기존 DB 검색 함수 시작 ===');
    console.log('현재 recognizedIngredients:', recognizedIngredients);
    
    // 배열이 아니거나 비어있을 때 처리
    if (!recognizedIngredients || !Array.isArray(recognizedIngredients) || recognizedIngredients.length === 0) {
      console.log('재료가 없음 - 에러 설정');
      setError('인식된 재료가 없습니다. ResultScreen에서 데이터가 전달되지 않았습니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('기존 DB에서 검색 시작, 재료들:', recognizedIngredients);
      
      let allRecommendations = [];
      
      // 각 재료에 대해 레시피 검색
      for (const ingredient of recognizedIngredients) {
        console.log(`"${ingredient}" 재료로 검색 중...`);
        
        let recommendations;
        if (Platform.OS === 'web') {
          recommendations = await recommendRecipesByIngredientWeb(ingredient, 5);
        } else {
          recommendations = await recommendRecipesByIngredientMobile(ingredient, 5);
        }
        
        console.log(`"${ingredient}" 검색 결과:`, recommendations);
        allRecommendations.push(...recommendations);
      }
      
      // 중복 제거 (같은 레시피 ID를 가진 것들)
      const uniqueRecommendations = allRecommendations.reduce((unique, recipe) => {
        if (!unique.find(r => r.id === recipe.id)) {
          unique.push(recipe);
        }
        return unique;
      }, []);
      
      console.log('최종 검색 결과 (중복 제거):', uniqueRecommendations);
      
      setRecipes(uniqueRecommendations);
      setSearchResult({ recommendations: uniqueRecommendations });
      
      if (uniqueRecommendations.length === 0) {
        setError(`기존 DB에서 인식된 재료(${recognizedIngredients.join(', ')})로 만들 수 있는 레시피를 찾을 수 없습니다.`);
      }
      
    } catch (err) {
      console.error('기존 DB 레시피 검색 오류:', err);
      setError(`기존 DB 검색 중 오류: ${err.message}`);
    } finally {
      setLoading(false);
      console.log('=== 기존 DB 검색 함수 완료 ===');
    }
  }, [recognizedIngredients]);

  // 컴포넌트 마운트 시 자동으로 레시피 검색
  useEffect(() => {
    console.log('useEffect 실행 - 기존 DB 검색 시작');
    searchRecipesByRecognizedIngredients();
  }, [searchRecipesByRecognizedIngredients]);

  // 개선된 레시피 항목 렌더링
  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeItem}
      onPress={() => showRecipeDetail(item)}
    >
      <Text style={styles.recipeName}>{item.title}</Text>
      {item.description && (
        <Text style={styles.recipeDescription}>{item.description}</Text>
      )}
      <Text style={styles.recipeIngredients}>
        재료: {item.allIngredients?.length > 0 ? item.allIngredients.join(', ') : '정보 없음'}
      </Text>
      {item.matchedIngredient && (
        <Text style={styles.matchedIngredient}>
          매칭된 재료: {item.matchedIngredient}
        </Text>
      )}
      <View style={styles.recipeInfoRow}>
        {item.cookingTime && (
          <Text style={styles.recipeInfo}>⏱️ {item.cookingTime}</Text>
        )}
        {item.difficulty && (
          <Text style={styles.recipeInfo}>📊 {item.difficulty}</Text>
        )}
        {item.category && (
          <Text style={styles.recipeInfo}>🏷️ {item.category}</Text>
        )}
      </View>
      <Text style={styles.tapHint}>탭하여 상세 레시피 보기</Text>
    </TouchableOpacity>
  );

  // 검색 결과 섹션 렌더링
  const renderSearchResults = () => {
    if (!searchResult || !searchResult.recommendations) return null;

    return (
      <View style={styles.searchResultsContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            🍳 기존 DB 레시피 검색 결과 ({searchResult.recommendations.length}개)
          </Text>
          <Text style={styles.sectionSubtitle}>
            {recognizedIngredients.join(', ')} 기반 검색
          </Text>
          {searchResult.recommendations.map((recipe, index) => (
            <View key={`recipe-${index}`}>
              {renderRecipeItem({ item: recipe })}
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* 데이터베이스 연결 상태 표시 */}
      {dbConnectionStatus && (
        <View style={[
          styles.dbStatusContainer,
          {
            backgroundColor: 
              dbConnectionStatus.includes('성공') ? '#E8F5E8' :
              dbConnectionStatus.includes('실패') ? '#FFEBEE' :
              '#FFF3E0'
          }
        ]}>
          <Text style={[
            styles.dbStatusText,
            {
              color: 
                dbConnectionStatus.includes('성공') ? '#2E7D32' :
                dbConnectionStatus.includes('실패') ? '#C62828' :
                '#F57C00'
            }
          ]}>
            📊 DB 상태: {dbConnectionStatus}
          </Text>
        </View>
      )}

      {/* 디버깅 정보 표시 */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          받은 데이터: {JSON.stringify(route.params)}
        </Text>
        <Text style={styles.debugText}>
          인식된 재료 수: {recognizedIngredients ? recognizedIngredients.length : 0}
        </Text>
        <Text style={styles.debugText}>
          플랫폼: {Platform.OS}
        </Text>
      </View>

      {/* 인식된 재료 표시 */}
      <View style={styles.recognizedIngredientsSection}>
        <Text style={styles.recognizedTitle}>🔍 인식된 재료</Text>
        <View style={styles.ingredientTags}>
          {recognizedIngredients && recognizedIngredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientTag}>
              <Text style={styles.ingredientTagText}>{ingredient}</Text>
            </View>
          ))}
        </View>
        {(!recognizedIngredients || recognizedIngredients.length === 0) && (
          <Text style={styles.noIngredientsText}>인식된 재료가 없습니다.</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>기존 DB에서 레시피를 검색하는 중...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={searchRecipesByRecognizedIngredients}
          >
            <Text style={styles.retryButtonText}>다시 검색</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderSearchResults}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                기존 DB에서 인식된 재료로 만들 수 있는 레시피가 없습니다.
              </Text>
              <Text style={styles.emptySubText}>
                다른 재료를 촬영해보세요.
              </Text>
            </View>
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
  dbStatusContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dbStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  debugContainer: {
    backgroundColor: '#FFE0B2',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  debugText: {
    fontSize: 10,
    color: '#E65100',
    marginBottom: 2,
  },
  recognizedIngredientsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  recognizedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  ingredientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ingredientTagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  noIngredientsText: {
    color: '#999',
    fontStyle: 'italic',
  },
  searchResultsContainer: {
    padding: 10,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    paddingHorizontal: 10,
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
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    flexGrow: 1,
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
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  recipeIngredients: {
    color: '#666',
    marginBottom: 3,
  },
  matchedIngredient: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 3,
  },
  recipeInfo: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  recipeInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  tapHint: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  emptySubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
  },
});

export default SearchRecipeScreen;
