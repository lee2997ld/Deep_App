import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// 모든 필요한 화면 컴포넌트 임포트
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SavedScreen from '../screens/SavedScreen'; 
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false, // 상단 헤더 숨김 (스크린에서 자체 헤더 구현 시)
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Saved') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFA500', // 활성화된 탭 색상
        tabBarInactiveTintColor: 'gray', // 비활성화된 탭 색상
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // 탭바 배경색
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5, // 아래쪽 패딩
          paddingTop: 5, // 위쪽 패딩
          height: 60, // 전체 높이
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{
          tabBarLabel: '식재료 검색',
        }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedScreen} 
        options={{
          tabBarLabel: '저장된 레시피',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarLabel: '설정',
        }}
      />
    </Tab.Navigator>
  );
}
