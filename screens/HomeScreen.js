import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const HomeScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 카메라 권한 요청
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // 갤러리에서 이미지 선택
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      processImage(result.assets[0].uri);
    }
  };

  // 카메라로 사진 촬영
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      processImage(result.assets[0].uri);
    }
  };

  // 이미지 전처리 및 모델 추론
  const processImage = async (uri) => {
    try {
      setLoading(true);
      
      // 이미지 리사이징 및 정규화
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 224, height: 224 } }],
        { format: SaveFormat.JPEG }
      );
      
      // 모델 로드
      const modelAsset = await Asset.loadAsync(require('../assets/vegetable_classifier.onnx'));
      const modelUri = modelAsset[0].localUri;
      const session = await InferenceSession.create(modelUri);
      
      // 이미지를 텐서로 변환
      const imageBase64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // 이미지 데이터를 Float32Array로 변환 (실제 구현은 이미지 처리 라이브러리에 따라 다를 수 있음)
      // 여기서는 간단한 예시만 제공
      const imageData = await prepareImageData(imageBase64);
      
      // 모델 입력 텐서 생성
      const inputTensor = new Tensor('float32', imageData, [1, 3, 224, 224]);
      
      // 모델 추론
      const feeds = { 'input': inputTensor };
      const results = await session.run(feeds);
      
      // 결과 처리
      const output = results.output.data;
      
      // 채소 라벨 로드
      const labelsAsset = await Asset.loadAsync(require('../assets/vegetable_labels.json'));
      const labelsUri = labelsAsset[0].localUri;
      const labelsJson = await FileSystem.readAsStringAsync(labelsUri);
      const labels = JSON.parse(labelsJson);
      
      // 최대 확률 클래스 찾기
      let maxIndex = 0;
      let maxProb = output[0];
      for (let i = 1; i < output.length; i++) {
        if (output[i] > maxProb) {
          maxProb = output[i];
          maxIndex = i;
        }
      }
      
      const vegetableName = labels[maxIndex];
      const confidence = maxProb;
      
      setLoading(false);
      
      // 결과 화면으로 이동
      navigation.navigate('Result', {
        imageUri: uri,
        vegetableName,
        confidence
      });
      
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert('오류', '이미지 처리 중 오류가 발생했습니다.');
    }
  };
  
  // 이미지 데이터 준비 함수 (실제 구현은 이미지 처리 방식에 따라 다름)
  const prepareImageData = async (base64Image) => {
    // 이 부분은 실제 이미지 처리 로직으로 대체해야 함
    // 예: RGB 이미지를 [0,1] 범위로 정규화하고 채널 순서 변경 등
    
    // 임시 예시 코드
    const imageArray = new Float32Array(3 * 224 * 224);
    // 이미지 처리 로직...
    
    return imageArray;
  };

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
          {image ? (
            <Image source={{ uri: image }} style={styles.foodIcon} />
          ) : (
            <View style={styles.foodIcon}>
              <Text style={styles.placeholderText}>식재료 촬영</Text>
            </View>
          )}
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
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loadingText}>식재료를 분석 중입니다...</Text>
          </View>
        )}
      </View>
      
      {/* 하단 버튼 영역 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton} onPress={takePhoto}>
          <View style={styles.buttonCircle}>
            <Text style={styles.buttonIcon}>📷</Text>
          </View>
          <Text style={styles.buttonText}>사진 촬영</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={pickImage}>
          <View style={styles.buttonCircle}>
            <Text style={styles.buttonIcon}>🖼️</Text>
          </View>
          <Text style={styles.buttonText}>갤러리</Text>
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
    fontSize: 10,
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
    position: 'relative',
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
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholderText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
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
    justifyContent: 'space-around',
    padding: 20,
  },
  bottomButton: {
    alignItems: 'center',
  },
  buttonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
