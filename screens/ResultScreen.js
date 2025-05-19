import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Alert // Alert 추가
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ResultScreen = ({ route, navigation }) => {
  const { imageUri, vegetableName, confidence } = route.params;
  
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
  
  // 현재 식재료의 정보 가져오기
  const info = foodInfo[vegetableName] || defaultInfo;
  
  // 신뢰도 계산 (오류 수정: NaN 방지)
  const confidencePercent = confidence && !isNaN(confidence) 
    ? (confidence * 100).toFixed(2) 
    : "0.00";
  
  // 추천 요리 정보 추가
  const getRecommendedDishes = (ingredient) => {
    const dishMap = {
      '양파': ['양파 스프', '양파 샐러드', '카레'],
      '파': ['파전', '된장찌개', '김치찌개'],
      '마늘': ['마늘빵', '로스트 치킨', '마늘 소스 파스타'],
      '당근': ['당근 케이크', '당근 주스', '비빔밥'],
      '고추': ['고추장찌개', '매운 볶음밥', '칠리'],
      '양배추': ['양배추 롤', '양배추 샐러드', '보쌈'],
      '두부': ['두부조림', '순두부찌개', '두부 샐러드'],
      '콩나물': ['콩나물국', '콩나물무침', '비빔밥'],
      '돼지고기': ['삼겹살', '돼지갈비찜', '돈까스'],
      '소고기': ['소고기 스테이크', '불고기', '소고기 무국'],
      '닭고기': ['치킨', '닭갈비', '삼계탕'],
      '김치': ['김치찌개', '김치볶음밥', '김치전'],
      '새우': ['새우튀김', '새우볶음밥', '해물찜'],
      '갈치': ['갈치조림', '갈치구이', '생선전'],
      '계란': ['계란찜', '계란말이', '오믈렛'],
      '감자': ['감자전', '감자조림', '감자 수프'],
      '고구마': ['고구마맛탕', '군고구마', '고구마 케이크'],
      '느타리버섯': ['버섯전골', '버섯볶음', '버섯 크림 수프'],
      '양송이버섯': ['버섯 리조또', '버섯 스테이크', '버섯 샐러드'],
      '새송이버섯': ['버섯 볶음', '버섯 전', '버섯 탕수']
    };
    
    return dishMap[ingredient] || ['정보 없음'];
  };
  
  const recommendedDishes = getRecommendedDishes(vegetableName);
  
  // 관련 식재료 추천 (함께 사용하면 좋은 재료)
  const getRelatedIngredients = (ingredient) => {
    const relatedMap = {
      '양파': ['마늘', '당근', '셀러리'],
      '파': ['마늘', '고추', '된장'],
      '마늘': ['양파', '파', '생강'],
      '당근': ['양파', '감자', '셀러리'],
      '고추': ['마늘', '파', '토마토'],
      '양배추': ['당근', '양파', '사과'],
      '두부': ['파', '김치', '간장'],
      '콩나물': ['파', '마늘', '고춧가루'],
      '돼지고기': ['마늘', '생강', '양파'],
      '소고기': ['마늘', '양파', '당근'],
      '닭고기': ['마늘', '생강', '양파'],
      '김치': ['파', '마늘', '양파'],
      '새우': ['마늘', '파', '생강'],
      '갈치': ['무', '마늘', '생강'],
      '계란': ['파', '당근', '양파'],
      '감자': ['당근', '양파', '셀러리'],
      '고구마': ['사과', '계피', '버터'],
      '느타리버섯': ['마늘', '파', '양파'],
      '양송이버섯': ['마늘', '파슬리', '타임'],
      '새송이버섯': ['마늘', '파', '고추']
    };
    
    return relatedMap[ingredient] || ['정보 없음'];
  };
  
  const relatedIngredients = getRelatedIngredients(vegetableName);
  
  // route.params 안전하게 처리 (params가 없는 경우 대비)
  const safeParams = route.params || {};
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView style={styles.container}>
        {/* 헤더 영역 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>식재료 분석 결과</Text>
          <View style={styles.headerRight} />
        </View>
        
        {/* 이미지 컨테이너 */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
              <Text style={styles.noImageText}>이미지 없음</Text>
            </View>
          )}
        </View>
        
        {/* 결과 컨테이너 */}
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.vegetableName}>{vegetableName || "알 수 없음"}</Text>
            <Text style={styles.confidence}>
              신뢰도: {confidencePercent}%
            </Text>
          </View>
          
          {/* 영양 정보 */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>영양 정보</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>칼로리:</Text>
              <Text style={styles.infoValue}>{info.calories}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>영양소:</Text>
              <Text style={styles.infoValue}>{info.nutrients}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>효능:</Text>
              <Text style={styles.infoValue}>{info.benefits}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>보관 팁:</Text>
              <Text style={styles.infoValue}>{info.tips}</Text>
            </View>
          </View>
          
          {/* 추천 요리 정보 */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>추천 요리</Text>
            <View style={styles.recommendedDishes}>
              {recommendedDishes.map((dish, index) => (
                <View key={index} style={styles.dishTag}>
                  <Text style={styles.dishText}>{dish}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* 관련 식재료 */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>함께 사용하면 좋은 재료</Text>
            <View style={styles.relatedIngredients}>
              {relatedIngredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientTag}>
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        {/* 버튼 */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.buttonText}>다른 식재료 분석하기</Text>
        </TouchableOpacity>
        
        {/* 레시피 검색 버튼 추가 */}
        <TouchableOpacity 
          style={styles.recipeButton}
          onPress={() => {
            // 레시피 검색 기능 구현
            // 향후 레시피 화면으로 이동할 수 있음
            Alert.alert('알림', `${vegetableName || '선택한 식재료'} 레시피를 검색합니다.`);
          }}
        >
          <Ionicons name="search-outline" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>레시피 검색하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  noImageText: {
    marginTop: 10,
    color: '#999',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    marginTop: 20,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 80,
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
    color: '#333',
    lineHeight: 22,
  },
  recommendedDishes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
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
    marginBottom: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginBottom: 15,
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
    marginBottom: 20,
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
