// ResultScreen.js에서 중복 제거 로직 추가 및 레시피 검색 기능 추가
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Alert,
  FlatList,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');
const CONFIDENCE_THRESHOLD = 0.25; // 25% 신뢰도 임계값

const ResultScreen = ({ route, navigation }) => {
  // SearchScreen에서 전달받은 값
  const { imageUri, detections = [], isMultiple, multipleResults } = route.params || {};
  
  // 선택된 식재료 (여러 식재료 중 현재 선택된 것)
  const [selectedVegetable, setSelectedVegetable] = useState(null);
  
  // 중복 제거: 클래스명 기준으로 중복 제거하여 고유한 식재료만 표시
  const uniqueDetections = detections
    .filter(det => det.confidence > CONFIDENCE_THRESHOLD) // 25% 이하 신뢰도 제외
    .reduce((unique, item) => {
      // 이미 해당 클래스가 있는지 확인
      const existingItem = unique.find(u => u.class === item.class);
      
      // 없으면 추가, 있으면 더 높은 신뢰도를 가진 항목 유지
      if (!existingItem) {
        unique.push(item);
      } else if (item.confidence > existingItem.confidence) {
        // 기존 항목을 더 높은 신뢰도를 가진 새 항목으로 교체
        const index = unique.indexOf(existingItem);
        unique[index] = item;
      }
      
      return unique;
    }, []);
  
  // 컴포넌트 마운트 시 첫 번째 채소 선택
  useEffect(() => {
    if (uniqueDetections.length > 0 && !selectedVegetable) {
      setSelectedVegetable(uniqueDetections[0]);
    }
  }, [uniqueDetections]);
  
  // 웹 스크롤 문제 해결
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.body.style.overflow = 'auto';
      return () => { document.body.style.overflow = ''; };
    }
  }, []);
  
  // 식재료별 정보 (한글명으로 매핑)
  const foodInfo = {
    '양파': {
      calories: '40 kcal/100g',
      nutrients: '비타민 C, 비타민 B6, 엽산',
      benefits: '항산화 작용, 혈당 조절, 심혈관 건강 개선',
      tips: '실온에서 통풍이 잘 되는 곳에 보관하세요.'
    },
    '파': {
      calories: '33 kcal/100g',
      nutrients: '비타민 K, 비타민 C, 망간',
      benefits: '면역력 강화, 항염 효과, 소화 촉진',
      tips: '냉장고에 신문지에 싸서 보관하세요.'
    },
    '마늘': {
      calories: '149 kcal/100g',
      nutrients: '망간, 비타민 B6, 비타민 C',
      benefits: '면역력 강화, 항균 작용, 혈액순환 개선',
      tips: '서늘하고 건조한 곳에 보관하세요.'
    },
    '당근': {
      calories: '41 kcal/100g',
      nutrients: '비타민 A, 비타민 K, 칼륨',
      benefits: '시력 개선, 면역력 향상, 피부 건강',
      tips: '당근 잎을 제거하고 냉장 보관하세요.'
    },
    '고추': {
      calories: '40 kcal/100g',
      nutrients: '비타민 C, 비타민 A, 비타민 B6',
      benefits: '신진대사 촉진, 면역력 강화, 항산화 작용',
      tips: '씻지 않고 냉장 보관하세요.'
    },
    '양배추': {
      calories: '25 kcal/100g',
      nutrients: '비타민 C, 비타민 K, 엽산',
      benefits: '소화 개선, 염증 감소, 해독 작용',
      tips: '통째로 랩에 싸서 냉장 보관하세요.'
    },
    '두부': {
      calories: '76 kcal/100g',
      nutrients: '단백질, 칼슘, 철분',
      benefits: '콜레스테롤 감소, 단백질 공급, 골다공증 예방',
      tips: '물에 담가 냉장 보관하고 자주 물을 갈아주세요.'
    },
    '콩나물': {
      calories: '30 kcal/100g',
      nutrients: '비타민 C, 엽산, 칼륨',
      benefits: '해독 작용, 소화 촉진, 숙취 해소',
      tips: '물에 담가 냉장 보관하세요.'
    },
    '돼지고기': {
      calories: '242 kcal/100g',
      nutrients: '단백질, 비타민 B1, 아연',
      benefits: '근육 발달, 에너지 생성, 면역력 강화',
      tips: '냉장 3일, 냉동 1개월 이내로 보관하세요.'
    },
    '소고기': {
      calories: '250 kcal/100g',
      nutrients: '단백질, 철분, 비타민 B12',
      benefits: '빈혈 예방, 근육 발달, 에너지 생성',
      tips: '냉장 3-5일, 냉동 6개월 이내로 보관하세요.'
    },
    '닭고기': {
      calories: '165 kcal/100g',
      nutrients: '단백질, 비타민 B6, 셀레늄',
      benefits: '근육 발달, 면역력 강화, 에너지 생성',
      tips: '냉장 2일, 냉동 3개월 이내로 보관하세요.'
    },
    '김치': {
      calories: '15 kcal/100g',
      nutrients: '비타민 C, 비타민 K, 프로바이오틱스',
      benefits: '장 건강 개선, 면역력 강화, 항산화 작용',
      tips: '밀폐 용기에 담아 냉장 보관하세요.'
    },
    '새우': {
      calories: '99 kcal/100g',
      nutrients: '단백질, 셀레늄, 비타민 B12',
      benefits: '심혈관 건강, 뇌 기능 향상, 항산화 작용',
      tips: '구입 당일 조리하거나 냉동 보관하세요.'
    },
    '갈치': {
      calories: '100 kcal/100g',
      nutrients: '단백질, 오메가-3, 비타민 D',
      benefits: '심혈관 건강, 뇌 기능 향상, 염증 감소',
      tips: '구입 당일 조리하거나 냉동 보관하세요.'
    },
    '계란': {
      calories: '155 kcal/100g',
      nutrients: '단백질, 비타민 D, 비타민 B12',
      benefits: '근육 발달, 뇌 건강, 면역력 강화',
      tips: '냉장고에 보관하고 3주 이내에 섭취하세요.'
    },
    '감자': {
      calories: '77 kcal/100g',
      nutrients: '비타민 C, 칼륨, 비타민 B6',
      benefits: '소화 개선, 혈압 조절, 에너지 공급',
      tips: '서늘하고 어두운 곳에 보관하세요.'
    },
    '고구마': {
      calories: '86 kcal/100g',
      nutrients: '비타민 A, 비타민 C, 망간',
      benefits: '혈당 조절, 소화 개선, 항산화 작용',
      tips: '서늘하고 어두운 곳에 보관하세요.'
    },
    '느타리버섯': {
      calories: '33 kcal/100g',
      nutrients: '비타민 D, 셀레늄, 아연',
      benefits: '면역력 강화, 콜레스테롤 감소, 항암 효과',
      tips: '종이봉투에 담아 냉장 보관하세요.'
    },
    '양송이버섯': {
      calories: '22 kcal/100g',
      nutrients: '비타민 D, 셀레늄, 비타민 B',
      benefits: '면역력 강화, 항산화 작용, 항염 효과',
      tips: '종이봉투에 담아 냉장 보관하세요.'
    },
    '새송이버섯': {
      calories: '37 kcal/100g',
      nutrients: '비타민 D, 셀레늄, 에르고티오네인',
      benefits: '면역력 강화, 항산화 작용, 콜레스테롤 감소',
      tips: '종이봉투에 담아 냉장 보관하세요.'
    }
  };

  // 기본 정보 (식재료 정보가 없을 경우)
  const defaultInfo = {
    calories: '정보 없음',
    nutrients: '정보 없음',
    benefits: '정보 없음',
    tips: '정보 없음'
  };
  
  // 현재 선택된 채소의 정보 가져오기
  const info = selectedVegetable ? 
    (foodInfo[selectedVegetable.class] || defaultInfo) : defaultInfo;
  
  // 신뢰도 계산
  const confidencePercent = selectedVegetable && selectedVegetable.confidence ? 
    (selectedVegetable.confidence * 100).toFixed(2) : "0.00";
  
  // 추천 요리 정보 추가
  const getRecommendedDishes = (ingredient) => {
    const dishMap = {
      '양파': ['양파 스프', '양파 샐러드', '카레', '양파감자전'],
      '파': ['파전', '된장찌개', '김치찌개', '파김치'],
      '마늘': ['마늘빵', '로스트 치킨', '마늘 소스 파스타', '마늘튀김'],
      '당근': ['당근 케이크', '당근 주스', '비빔밥', '당근 샐러드'],
      '고추': ['고추장찌개', '매운 볶음밥', '칠리', '고추튀김'],
      '양배추': ['양배추 롤', '양배추 샐러드', '보쌈', '양배추 피클'],
      '두부': ['두부조림', '순두부찌개', '두부 샐러드', '두부 스테이크'],
      '콩나물': ['콩나물국', '콩나물무침', '비빔밥', '콩나물 볶음'],
      '돼지고기': ['삼겹살', '돼지갈비찜', '돈까스', '김치찌개'],
      '소고기': ['소고기 스테이크', '불고기', '소고기 무국', '육개장'],
      '닭고기': ['치킨', '닭갈비', '삼계탕', '닭다리 데리야끼 구이'],
      '김치': ['김치찌개', '김치볶음밥', '김치전', '김치만두'],
      '새우': ['새우튀김', '새우볶음밥', '해물찜', '버터 콘새우 파스타'],
      '갈치': ['갈치조림', '갈치구이', '생선전', '갈치무조림'],
      '계란': ['계란찜', '계란말이', '오믈렛', '계란국'],
      '감자': ['감자전', '감자조림', '감자 수프', '감자채전', '알감자조림', '감자 샐러드'],
      '고구마': ['고구마맛탕', '군고구마', '고구마 케이크', '고구마김치또띠아롤', '고구마만두', '고구마생채'],
      '느타리버섯': ['버섯전골', '버섯볶음', '버섯 크림 수프', '버섯 리조또'],
      '양송이버섯': ['버섯 리조또', '버섯 스테이크', '버섯 샐러드', '버섯 크림 파스타'],
      '새송이버섯': ['버섯 볶음', '버섯 전', '버섯 탕수', '버섯 구이']
    };
    
    return dishMap[ingredient] || ['정보 없음'];
  };
  
  // 현재 선택된 채소의 추천 요리
  const recommendedDishes = selectedVegetable ? 
    getRecommendedDishes(selectedVegetable.class) : [];
  
  // 관련 식재료 추천 (함께 사용하면 좋은 재료)
  const getRelatedIngredients = (ingredient) => {
    const relatedMap = {
      '양파': ['마늘', '당근', '셀러리'],
      '파': ['소고기', '마늘', '생강'],
      '마늘': ['양파', '생강', '파'],
      '당근': ['양파', '감자', '셀러리'],
      '고추': ['마늘', '양파', '돼지고기'],
      '양배추': ['당근', '사과', '양파'],
      '두부': ['마늘', '파', '고추'],
      '콩나물': ['파', '마늘', '버섯'],
      '돼지고기': ['고추', '마늘', '양파'],
      '소고기': ['양파', '마늘', '버섯'],
      '닭고기': ['마늘', '생강', '양파'],
      '김치': ['두부', '돼지고기', '파'],
      '새우': ['마늘', '고추', '양파'],
      '갈치': ['무', '마늘', '생강'],
      '계란': ['파', '양파', '시금치'],
      '감자': ['양파', '당근', '파'],
      '고구마': ['사과', '계피', '버터'],
      '느타리버섯': ['마늘', '파', '양파'],
      '양송이버섯': ['마늘', '파슬리', '양파'],
      '새송이버섯': ['마늘', '파', '양파']
    };
    
    return relatedMap[ingredient] || ['정보 없음'];
  };
  
  // 현재 선택된 채소의 관련 식재료
  const relatedIngredients = selectedVegetable ? 
    getRelatedIngredients(selectedVegetable.class) : [];
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>식재료 분석 결과</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {/* 이미지 컨테이너 */}
        <View style={styles.section}>
          {imageUri ? (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.image}
              resizeMode="cover"
              progressiveRenderingEnabled={true}
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
              <Text style={styles.noImageText}>이미지 없음</Text>
            </View>
          )}
        </View>
        
        {/* 감지된 여러 채소 목록 (중복 제거됨) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>감지된 식재료 목록</Text>
          
          {uniqueDetections.length === 0 ? (
            <Text style={styles.noResult}>25% 이상 신뢰도의 식재료가 없습니다.</Text>
          ) : (
            <View style={styles.vegetableList}>
              {uniqueDetections.map((det, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.vegetableItem,
                    selectedVegetable && selectedVegetable.class === det.class ? 
                      styles.selectedVegetableItem : null
                  ]}
                  onPress={() => setSelectedVegetable(det)}
                >
                  <Text style={styles.vegetableItemName}>{det.class}</Text>
                  <Text style={styles.vegetableItemConfidence}>
                    {(det.confidence * 100).toFixed(2)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* 선택된 채소 상세 정보 */}
        {selectedVegetable && (
          <>
            <View style={styles.section}>
              <View style={styles.resultHeader}>
                <Text style={styles.vegetableName}>{selectedVegetable.class}</Text>
                <Text style={styles.confidence}>
                  신뢰도: {confidencePercent}%
                </Text>
              </View>
              
              {/* 영양 정보 */}
              <View style={styles.infoContainer}>
                <Text style={styles.sectionTitle}>영양 정보</Text>
                
                <View style={styles.settingItem}>
                  <Text style={styles.infoLabel}>칼로리:</Text>
                  <Text style={styles.infoValue}>{info.calories}</Text>
                </View>
                
                <View style={styles.settingItem}>
                  <Text style={styles.infoLabel}>영양소:</Text>
                  <Text style={styles.infoValue}>{info.nutrients}</Text>
                </View>
                
                <View style={styles.settingItem}>
                  <Text style={styles.infoLabel}>효능:</Text>
                  <Text style={styles.infoValue}>{info.benefits}</Text>
                </View>
                
                <View style={styles.settingItem}>
                  <Text style={styles.infoLabel}>보관 팁:</Text>
                  <Text style={styles.infoValue}>{info.tips}</Text>
                </View>
              </View>
            </View>
            
            {/* 추천 요리 정보 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>추천 요리</Text>
              <View style={styles.recommendedDishes}>
                {recommendedDishes.map((dish, index) => (
                  <View key={index} style={styles.dishTag}>
                    <Text style={styles.dishText}>{dish}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {/* 관련 식재료 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>함께 사용하면 좋은 재료</Text>
              <View style={styles.relatedIngredients}>
                {relatedIngredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientTag}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
        
        {/* 다른 식재료 분석하기 버튼 */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('SearchScreen')}
        >
          <Ionicons name="camera-outline" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>다른 식재료 분석하기</Text>
        </TouchableOpacity>

        {/* 레시피 찾기 버튼 - 수정된 부분 */}
        {uniqueDetections.length > 0 && (
          <TouchableOpacity 
            style={styles.recipeButton}
            onPress={() => {
              // 모든 인식된 재료들을 배열로 전달
              const allRecognizedIngredients = uniqueDetections.map(det => det.class);
              
              console.log('전달할 재료들:', allRecognizedIngredients); // 디버깅용
              
              navigation.navigate('SRecipe', {  // SearchRecipe → SRecipe로 변경
                recognizedIngredients: allRecognizedIngredients
              });
            }}
          >
            <Ionicons name="restaurant-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>레시피 찾기 ({uniqueDetections.length}개 재료)</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    height: Platform.OS === 'web' ? '100vh' : null,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 15,
  },
  noImageContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
  },
  noImageText: {
    marginTop: 10,
    color: '#999',
  },
  noResult: {
    color: '#888',
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
  },
  vegetableList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  vegetableItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedVegetableItem: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  vegetableItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  vegetableItemConfidence: {
    fontSize: 14,
    color: '#666',
  },
  resultHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
  },
  vegetableName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  confidence: {
    fontSize: 16,
    color: '#757575',
  },
  infoContainer: {
    marginTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  recommendedDishes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  dishTag: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  dishText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  relatedIngredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  ingredientTag: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  ingredientText: {
    color: '#1565C0',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  recipeButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  }
});

export default ResultScreen;