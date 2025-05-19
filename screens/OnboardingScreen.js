import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  FlatList,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// 온보딩 데이터 (이미지 대신 아이콘 사용)
const onboardingData = [
  {
    id: '1',
    title: '식재료 인식 AI',
    description: '촬영하거나 갤러리에서 선택한 식재료를 인공지능이 자동으로 인식해줍니다.',
    iconName: 'camera-outline'
  },
  {
    id: '2',
    title: '맞춤형 레시피 추천',
    description: '인식된 식재료를 기반으로 만들 수 있는 다양한 요리 레시피를 추천해드립니다.',
    iconName: 'restaurant-outline'
  },
  {
    id: '3',
    title: '간편한 요리 가이드',
    description: '단계별 안내와 함께 누구나 쉽게 따라할 수 있는 요리 가이드를 제공합니다.',
    iconName: 'book-outline'
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  
  // 다음 화면으로 이동
  const goToNextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // 마지막 슬라이드에서는 메인 화면으로 이동
      completeOnboarding();
    }
  };
  
  // 온보딩 완료 및 메인 화면으로 이동
  const completeOnboarding = async () => {
    try {
      // 온보딩 완료 상태 저장 (앱 재실행 시 온보딩 스킵)
      await AsyncStorage.setItem('onboardingCompleted', 'true');
    } catch (error) {
      console.log('AsyncStorage 저장 오류:', error);
    }
    // 메인 탭 화면으로 이동
    navigation.replace('MainTabs');
  };
  
  // 온보딩 건너뛰기
  const skipOnboarding = () => {
    completeOnboarding();
  };
  
  // 각 슬라이드 렌더링
  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Ionicons name={item.iconName} size={120} color="#FFA500" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };
  
  // 인디케이터 렌더링
  const renderDotIndicators = () => {
    return onboardingData.map((_, index) => (
      <View
        key={index}
        style={[
          styles.dot,
          { backgroundColor: index === currentIndex ? '#FFA500' : '#E0E0E0' }
        ]}
      />
    ));
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 건너뛰기 버튼 */}
      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={skipOnboarding}
      >
        <Text style={styles.skipText}>건너뛰기</Text>
      </TouchableOpacity>
      
      {/* 슬라이드 리스트 */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
      />
      
      {/* 하단 컨트롤 영역 */}
      <View style={styles.bottomContainer}>
        <View style={styles.indicatorContainer}>
          {renderDotIndicators()}
        </View>
        
        {/* 다음/시작하기 버튼 */}
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={goToNextSlide}
        >
          {currentIndex === onboardingData.length - 1 ? (
            <Text style={styles.nextButtonText}>시작하기</Text>
          ) : (
            <Ionicons name="arrow-forward" size={24} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    width: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  nextButton: {
    backgroundColor: '#FFA500',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  nextButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default OnboardingScreen;
