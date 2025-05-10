import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigator } from './BottomTabNavigator';

// 다른 화면들 import...

const Stack = createStackNavigator();

export function MainNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* 로그인 화면 등 필요한 화면들 */}
        
        {/* 메인 화면으로 BottomTabNavigator 사용 */}
        <Stack.Screen 
          name="MainTabs" 
          component={BottomTabNavigator} 
          options={{ headerShown: false }}
        />
        
        {/* 탭 내비게이션 외부에서 접근할 화면들 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
