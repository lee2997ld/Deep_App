import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigator } from './BottomTabNavigator';
import { View, Text } from 'react-native';

// 이미 구현된 화면 임포트
// ResultScreen, OnboardingScreen은 이미 구현되어 있다고 가정
import ResultScreen from '../screens/ResultScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SearchRecipeScreen from '../screens/SearchRecipeScreen';


// 아직 구현되지 않은 화면들을 위한 임시 컴포넌트
const PlaceholderScreen = ({ route, navigation, screenName }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, marginBottom: 20 }}>{screenName} 화면</Text>
    <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginHorizontal: 30 }}>
      이 화면은 아직 개발 중입니다.
    </Text>
  </View>
);

// 임시 화면 컴포넌트들
const LoginScreen = (props) => <PlaceholderScreen {...props} screenName="로그인" />;
const RegisterScreen = (props) => <PlaceholderScreen {...props} screenName="회원가입" />;
const RecipeDetailScreen = (props) => <PlaceholderScreen {...props} screenName="레시피 상세" />;

const Stack = createStackNavigator();

export function MainNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs" // Onboarding 대신 MainTabs로 시작 (개발 편의를 위해)
        screenOptions={{
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: '#FFA500',
            elevation: 0, // Android에서 그림자 제거
            shadowOpacity: 0, // iOS에서 그림자 제거
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          cardStyle: { backgroundColor: '#FFFFFF' }
        }}
      >
        {/* 온보딩 및 인증 화면 */}
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ 
            title: '로그인',
            animationTypeForReplace: 'pop',
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: '회원가입' }}
        />
        
        {/* 메인 앱 화면 (탭 네비게이터) */}
        <Stack.Screen 
          name="MainTabs" 
          component={BottomTabNavigator} 
          options={{ headerShown: false }}
        />

        {/* 레시피 알려주는 화면*/}
        <Stack.Screen 
          name="SRecipe" 
          component={SearchRecipeScreen} 
          options={{ title: '레시피 추천' }}
        />
        
        {/* 탭 네비게이션 외부에서 접근할 화면들 */}
        <Stack.Screen 
          name="Result" 
          component={ResultScreen} 
          options={({ route }) => ({
            title: '식재료 분석 결과',
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            // route.params가 undefined일 수 있으므로 옵셔널 체이닝 사용
            headerTitle: route.params?.vegetableName 
              ? `${route.params.vegetableName} 분석 결과` 
              : '식재료 분석 결과',
          })}
        />
        <Stack.Screen 
          name="RecipeDetail" 
          component={RecipeDetailScreen} 
          options={({ route }) => ({
            title: route.params?.recipeName || '레시피',
            headerStyle: {
              backgroundColor: '#FF5722',
            },
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
