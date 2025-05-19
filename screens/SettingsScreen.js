import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* 알림 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <Text style={styles.settingLabel}>푸시 알림</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ccc', true: '#FFA50088' }}
              thumbColor={notificationsEnabled ? '#FFA500' : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* 앱 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 설정</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="moon-outline" size={24} color="#333" />
              <Text style={styles.settingLabel}>다크 모드</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#ccc', true: '#FFA50088' }}
              thumbColor={darkModeEnabled ? '#FFA500' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="language-outline" size={24} color="#333" />
              <Text style={styles.settingLabel}>언어</Text>
            </View>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>한국어</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* 계정 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="person-outline" size={24} color="#333" />
              <Text style={styles.settingLabel}>프로필 편집</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#333" />
              <Text style={styles.settingLabel}>비밀번호 변경</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        
        {/* 기타 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기타</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="help-circle-outline" size={24} color="#333" />
              <Text style={styles.settingLabel}>도움말</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="information-circle-outline" size={24} color="#333" />
              <Text style={styles.settingLabel}>앱 정보</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        
        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#999',
    marginRight: 5,
  },
  logoutButton: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 16,
    marginVertical: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default SettingsScreen;
