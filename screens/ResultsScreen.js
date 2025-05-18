import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';

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
  
  // 영어 이름으로 된 클래스명을 한글로 변환 (필요한 경우)
  const getKoreanName = (englishName) => {
    const nameMap = {
      'onion': '양파',
      'green_onion': '파',
      'garlic': '마늘',
      'carrot': '당근',
      'pepper': '고추',
      'cabbage': '양배추',
      'tofu': '두부',
      'bean_sprouts': '콩나물',
      'pork': '돼지고기',
      'beef': '소고기',
      'chicken': '닭고기',
      'kimchi': '김치',
      'shrimp': '새우',
      'hairtail': '갈치',
      'egg': '계란',
      'potato': '감자',
      'sweet_potato': '고구마',
      'mush_1': '느타리버섯',
      'mush_2': '양송이버섯',
      'mush_3': '새송이버섯'
    };
    return nameMap[englishName] || englishName;
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>
      
      <View style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.vegetableName}>{vegetableName}</Text>
          <Text style={styles.confidence}>
            신뢰도: {(confidence * 100).toFixed(2)}%
          </Text>
        </View>
        
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
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>다른 식재료 분석하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
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
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
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
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResultScreen;
