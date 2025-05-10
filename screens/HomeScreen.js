import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const HomeScreen = () => {
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
          <TouchableOpacity>
            {/* <Image 
              source={require('../assets/profile.png')} 
              style={styles.iconImage} 
            /> */}
          </TouchableOpacity>
          <TouchableOpacity>
            {/* <Image 
              source={require('../assets/menu.png')} 
              style={styles.iconImage} 
            /> */}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 메인 카드 영역 */}
      <View style={styles.mainCard}>
        <Text style={styles.mainTitle}>쉽고 간편하게{'\n'}집에서 해먹는 집밥!</Text>
        
        <View style={styles.foodIconContainer}>
          {/* <Image 
            source={require('../assets/food-icon.png')} 
            style={styles.foodIcon}
          /> */}
        </View>
        
        <View style={styles.recommendationContainer}>
          <Text style={styles.recommendationTitle}>오늘의 추천!</Text>
          
          <View style={styles.recommendationList}>
            <Text style={styles.recommendationItem}>1. 한식의 대가느낌 김치찌개!</Text>
            <Text style={styles.recommendationItem}>2. 중식 스타일 계란 볶음밥!</Text>
            <Text style={styles.recommendationItem}>3. 항상 집에서 먹던 계란 장조림!</Text>
            <Text style={styles.recommendationItem}>4. 재결 시금치로 만드는 시금치 무침!</Text>
          </View>
        </View>
      </View>
      
      {/* 하단 버튼 영역 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton}>
          {/* <Image 
            source={require('../assets/add.png')} 
            style={styles.bottomIcon} 
          /> */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          {/* <Image 
            source={require('../assets/heart.png')} 
            style={styles.bottomIcon} 
          /> */}
        </TouchableOpacity>
      </View>
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconImage: {
    width: 24,
    height: 24,
    marginLeft: 15,
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
  foodIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  foodIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  recommendationContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recommendationList: {
    marginTop: 5,
  },
  recommendationItem: {
    fontSize: 16,
    marginBottom: 8,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  bottomButton: {
    marginHorizontal: 15,
  },
  bottomIcon: {
    width: 30,
    height: 30,
  },
});

export default HomeScreen;
