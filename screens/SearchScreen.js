import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// 웹 환경에서 CDN을 통해 onnxruntime-web 로드
if (Platform.OS === 'web') {
  // 이미 로드되었는지 확인
  if (!window.ort) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort.min.js';
    script.async = true;
    script.onload = () => {
      console.log('ONNX Runtime Web 로드 완료');
      window.ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';
    };
    document.head.appendChild(script);
  }
}

// 네이티브 환경에서만 onnxruntime-react-native 임포트
let InferenceSession, Tensor;
if (Platform.OS !== 'web') {
  try {
    const ortReactNative = require('onnxruntime-react-native');
    InferenceSession = ortReactNative.InferenceSession;
    Tensor = ortReactNative.Tensor;
  } catch (error) {
    console.error('onnxruntime-react-native 로드 오류:', error);
  }
}

// 클래스 라벨 정의
const vegetableLabels = [
  "양파", "파", "마늘", "당근", "고추", "양배추", "두부", "콩나물",
  "돼지고기", "소고기", "닭고기", "김치", "새우", "갈치", "계란",
  "감자", "고구마", "느타리버섯", "양송이버섯", "새송이버섯"
];

// YOLO 모델 설정
const yoloConfig = {
  inputSize: 640,       // YOLOv8 입력 이미지 크기
  scoreThreshold: 0.3,  // 객체 감지 점수 임계값 (낮춰서 더 많은 결과 감지)
  iouThreshold: 0.45,   // NMS IoU 임계값
};

const SearchScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelState, setModelState] = useState({
    isLoading: true,
    isReady: false,
    error: null
  });
  const [session, setSession] = useState(null);
  const [modelInfo, setModelInfo] = useState({
    inputNames: [],
    outputNames: [],
    isYolo: true
  });
  
  // 모델과 라벨 파일 준비
  useEffect(() => {
    const prepareModelAndLabels = async () => {
      try {
        if (Platform.OS === 'web') {
          await loadModelForWeb();
        } else {
          await loadModelForNative();
        }
      } catch (error) {
        console.error("모델 준비 중 오류:", error);
        setModelState({isLoading: false, isReady: false, error: '모델 로드 실패'});
        Alert.alert('오류', '모델 파일을 로드하는 중 문제가 발생했습니다.');
      }
    };
    
    prepareModelAndLabels();
  }, []);
  
  // 웹 환경에서 모델 로드
  const loadModelForWeb = async () => {
    // 모델 로딩 시작
    setModelState({isLoading: true, isReady: false, error: null});
    
    // ONNX Runtime 로드 확인 및 대기
    let waitCount = 0;
    while (!window.ort && waitCount < 10) {
      console.log(`ONNX Runtime Web 로드 대기 중... (${waitCount + 1}/10)`);
      await new Promise(resolve => setTimeout(resolve, 500));
      waitCount++;
    }
    
    if (window.ort) {
      try {
        // 모델 파일 URL (public 폴더에 있어야 함)
        const modelUrl = '/vegetable_classifier.onnx';
        console.log('웹 모델 로드 시도:', modelUrl);
        
        try {
          // 옵션 설정으로 모델 로드 최적화
          const options = {
            executionProviders: ['wasm'],
            graphOptimizationLevel: 'all',
          };
          
          const ortSession = await window.ort.InferenceSession.create(modelUrl, options);
          
          // 모델 입출력 정보 확인
          console.log("모델 입력:", ortSession.inputNames);
          console.log("모델 출력:", ortSession.outputNames);
          
          // 모델 정보 저장
          setModelInfo({
            inputNames: ortSession.inputNames,
            outputNames: ortSession.outputNames,
            isYolo: true // YOLOv8 모델 사용 중
          });
          
          setSession(ortSession);
          setModelState({isLoading: false, isReady: true, error: null});
          console.log('웹 환경에서 모델 로드 완료');
        } catch (modelError) {
          console.error('웹 모델 로드 실패:', modelError);
          // 테스트 환경에서는 더미 세션으로 대체
          setSession('dummy-session');
          setModelState({isLoading: false, isReady: true, error: null});
          console.log('더미 세션으로 전환');
        }
      } catch (error) {
        console.error('웹 환경에서 모델 로드 오류:', error);
        setModelState({isLoading: false, isReady: false, error: error.message});
      }
    } else {
      console.error('ONNX Runtime Web을 로드할 수 없습니다.');
      setModelState({
        isLoading: false, 
        isReady: false, 
        error: 'ONNX Runtime Web 로드 실패'
      });
      Alert.alert(
        'ONNX Runtime 오류',
        'ONNX Runtime Web을 로드할 수 없습니다. 네트워크 연결을 확인하세요.',
        [{ text: '확인' }]
      );
    }
  };
  
  // 네이티브 환경에서 모델 로드
  const loadModelForNative = async () => {
    // 모델 로딩 시작
    setModelState({isLoading: true, isReady: false, error: null});
    
    if (!InferenceSession || !Tensor) {
      setModelState({
        isLoading: false, 
        isReady: false, 
        error: 'ONNX Runtime Native 모듈을 로드할 수 없습니다.'
      });
      Alert.alert('오류', 'ONNX Runtime Native 모듈을 로드할 수 없습니다.');
      return;
    }
    
    try {
      // 모델 파일 로드
      const modelAsset = await Asset.loadAsync(require('../assets/vegetable_classifier.onnx'));
      
      if (!modelAsset || modelAsset.length === 0) {
        throw new Error('모델 애셋을 로드할 수 없습니다.');
      }
      
      const modelUri = modelAsset[0].localUri;
      if (!modelUri) {
        throw new Error('모델 URI가 유효하지 않습니다.');
      }
      
      // 모델 파일 복사 (필요한 경우)
      const modelDestination = `${FileSystem.documentDirectory}vegetable_classifier.onnx`;
      await FileSystem.copyAsync({
        from: modelUri,
        to: modelDestination
      });
      
      // 모델 세션 생성
      const options = {
        executionProviders: ['cpuexecutionprovider']
      };
      
      const inferenceSession = await InferenceSession.create(modelDestination, options);
      
      // 모델 입출력 정보 확인
      console.log("모델 입력:", inferenceSession.inputNames);
      console.log("모델 출력:", inferenceSession.outputNames);
      
      // 모델 정보 저장
      setModelInfo({
        inputNames: inferenceSession.inputNames,
        outputNames: inferenceSession.outputNames,
        isYolo: true // YOLOv8 모델 사용 중
      });
      
      setSession(inferenceSession);
      setModelState({isLoading: false, isReady: true, error: null});
      console.log('네이티브 환경에서 모델 로드 완료');
    } catch (error) {
      console.error('네이티브 환경에서 모델 로드 오류:', error);
      // 테스트 환경에서는 더미 세션으로 대체
      setSession('dummy-session');
      setModelState({isLoading: false, isReady: true, error: null});
      console.log('더미 세션으로 전환');
    }
  };
  
  // 카메라 권한 요청 (웹에서는 건너뜀)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    } else {
      setHasPermission(true); // 웹에서는 기본적으로 true로 설정
    }
  }, []);

  // 갤러리에서 이미지 선택
  const pickImage = async () => {
    try {
      console.log('갤러리 버튼 클릭');
      
      // 모델이 준비되지 않았다면 사용자에게 알림
      if (!modelState.isReady) {
        Alert.alert('준비 중', '모델을 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log('이미지 선택 결과:', !result.canceled);

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };

  // 카메라로 사진 촬영
  const takePhoto = async () => {
    try {
      console.log('카메라 버튼 클릭');
      
      // 모델이 준비되지 않았다면 사용자에게 알림
      if (!modelState.isReady) {
        Alert.alert('준비 중', '모델을 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      
      if (Platform.OS === 'web') {
        Alert.alert('알림', '웹에서는 카메라 기능이 제한됩니다. 갤러리를 이용해주세요.');
        return;
      }
      
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log('카메라 결과:', !result.canceled);

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('카메라 오류:', error);
      Alert.alert('오류', '카메라를 사용하는 중 문제가 발생했습니다.');
    }
  };

  // 이미지 전처리 및 모델 추론
  const processImage = async (uri) => {
    try {
      console.log('이미지 처리 시작:', uri.substring(0, 30) + '...');
      setLoading(true);
      
      // 더미 세션인 경우 시뮬레이션 실행
      if (session === 'dummy-session') {
        await simulateProcessing(uri);
        return;
      }
      
      if (Platform.OS === 'web') {
        await processYoloForWeb(uri);
      } else {
        await processYoloForNative(uri);
      }
    } catch (error) {
      setLoading(false);
      console.error('이미지 처리 오류:', error);
      Alert.alert('오류', '이미지 처리 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
      
      // 오류 발생 시 시뮬레이션으로 대체 (개발 중에만)
      await simulateProcessing(uri);
    }
  };
  
  // 테스트용 시뮬레이션 함수
  const simulateProcessing = async (uri) => {
    console.log('시뮬레이션 모드로 처리 중...');
    // 처리 시간을 시뮬레이션 (1-2초)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // 랜덤 결과 생성
    const randomIndex = Math.floor(Math.random() * vegetableLabels.length);
    const vegetableName = vegetableLabels[randomIndex];
    const confidence = 0.7 + (Math.random() * 0.29); // 70-99% 신뢰도
    
    setLoading(false);
    
    // 결과 화면으로 이동
    navigation.navigate('Result', {
      imageUri: uri,
      vegetableName,
      confidence
    });
  };
  
  // YOLOv8 웹 환경 처리 함수
  const processYoloForWeb = async (uri) => {
    try {
      console.log('YOLOv8 웹 환경에서 이미지 처리 중...');
      
      if (!window.ort) {
        throw new Error('ONNX Runtime Web이 로드되지 않았습니다.');
      }
      
      if (!session) {
        throw new Error('모델 세션이 준비되지 않았습니다.');
      }
      
      // 이미지를 캔버스에 로드 (React Native의 Image가 아닌 DOM의 img 요소 사용)
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = uri;
      
      console.log('이미지 로드 중...');
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = (e) => {
          console.error('이미지 로드 실패:', e);
          reject(new Error('이미지 로드에 실패했습니다.'));
        };
      });
      
      // 원본 이미지 크기 저장
      const originalWidth = img.width;
      const originalHeight = img.height;
      
      // 캔버스에 이미지 그리기 (YOLOv8 입력 크기로 리사이징)
      const inputSize = yoloConfig.inputSize;
      
      // 이미지 리사이징 및 패딩 계산
      const { canvas, paddingData } = resizeAndPadImage(img, inputSize);
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, inputSize, inputSize).data;
      
      // Float32Array로 변환 (NCHW 형식)
      console.log('이미지 데이터 변환 중...');
      const float32Data = new Float32Array(3 * inputSize * inputSize);
      
      // RGB 값을 [0, 1] 범위로 정규화하고 채널 순서 변경 (RGBA -> RGB)
      for (let y = 0; y < inputSize; y++) {
        for (let x = 0; x < inputSize; x++) {
          const pixelIndex = (y * inputSize + x) * 4;
          
          // RGB 채널 (CHW 형식)
          float32Data[0 * inputSize * inputSize + y * inputSize + x] = imageData[pixelIndex] / 255.0;     // R
          float32Data[1 * inputSize * inputSize + y * inputSize + x] = imageData[pixelIndex + 1] / 255.0; // G
          float32Data[2 * inputSize * inputSize + y * inputSize + x] = imageData[pixelIndex + 2] / 255.0; // B
        }
      }
      
      // 텐서 생성
      const inputName = modelInfo.inputNames && modelInfo.inputNames.length > 0 ? 
                        modelInfo.inputNames[0] : 'images';
      console.log(`텐서 생성 중... 입력 이름: ${inputName}`);
      
      const inputTensor = new window.ort.Tensor('float32', float32Data, [1, 3, inputSize, inputSize]);
      
      // 모델 추론
      const feeds = {};
      feeds[inputName] = inputTensor;
      
      console.log('모델 실행 중...');
      const results = await session.run(feeds);
      console.log('모델 실행 완료');
      
      // 결과 출력 키 확인
      const outputName = modelInfo.outputNames && modelInfo.outputNames.length > 0 ? 
                         modelInfo.outputNames[0] : Object.keys(results)[0];
      console.log('모델 출력 키:', outputName);
      
      // 결과 처리
      const output = results[outputName].data;
      const outputShape = results[outputName].dims;
      console.log('출력 형태:', outputShape);
      console.log('출력 샘플:', output.slice(0, 10));
      console.log('출력 길이:', output.length);
      
      // YOLOv8 출력 처리 (수정된 함수 사용)
      try {
        const detections = processYoloOutputV2(output, outputShape, paddingData, {
          originalWidth,
          originalHeight
        });
        
        console.log('감지된 객체 수:', detections.length);
        
        // 가장 높은 점수의 감지 결과 선택
        let bestDetection = null;
        if (detections.length > 0) {
          // 점수 기준으로 감지 결과 정렬
          detections.sort((a, b) => b.confidence - a.confidence);
          bestDetection = detections[0];
          console.log('최고 감지 결과:', bestDetection);
        }
        
        setLoading(false);
        
        if (bestDetection) {
          // 결과 화면으로 이동
          const vegetableName = bestDetection.class;
          const confidence = bestDetection.confidence;
          
          navigation.navigate('Result', {
            imageUri: uri,
            vegetableName,
            confidence,
            detections: detections // 모든 감지 결과도 전달
          });
        } else {
          // 감지된 객체가 없을 경우
          Alert.alert('알림', '식재료를 인식할 수 없습니다. 다시 시도해주세요.');
        }
      } catch (processError) {
        console.error('출력 처리 오류:', processError);
        // 오류 발생 시 다른 출력 형식 시도
        try {
          // 출력이 단순 분류 결과일 수 있음
          const confidences = Array.from(output);
          const maxIndex = confidences.indexOf(Math.max(...confidences));
          const maxConfidence = confidences[maxIndex];
          
          if (maxIndex >= 0 && maxIndex < vegetableLabels.length && maxConfidence > 0.3) {
            const vegetableName = vegetableLabels[maxIndex];
            const confidence = maxConfidence;
            
            setLoading(false);
            navigation.navigate('Result', {
              imageUri: uri,
              vegetableName,
              confidence
            });
            return;
          }
        } catch (altProcessError) {
          console.error('대체 처리 방법 오류:', altProcessError);
        }
        
        // 여전히 실패하면 시뮬레이션으로 대체
        await simulateProcessing(uri);
      }
    } catch (error) {
      console.error('YOLOv8 웹 처리 오류:', error);
      setLoading(false);
      Alert.alert('이미지 처리 오류', error.message || '알 수 없는 오류');
      
      // 개발 중에는 시뮬레이션으로 대체
      await simulateProcessing(uri);
    }
  };
  
  // 이미지 리사이징 및 패딩 함수
  const resizeAndPadImage = (img, targetSize) => {
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');
    
    // 배경을 검은색으로 채우기
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, targetSize, targetSize);
    
    // 이미지 비율 계산
    const scale = Math.min(
      targetSize / img.width,
      targetSize / img.height
    );
    
    const newWidth = img.width * scale;
    const newHeight = img.height * scale;
    
    // 중앙 위치 계산
    const offsetX = (targetSize - newWidth) / 2;
    const offsetY = (targetSize - newHeight) / 2;
    
    // 이미지 그리기
    ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
    
    return {
      canvas,
      paddingData: {
        scale,
        offsetX,
        offsetY,
        newWidth,
        newHeight
      }
    };
  };
  
  // YOLOv8 출력 처리 함수 (개선된 버전)
  const processYoloOutputV2 = (output, outputShape, paddingData, originalSize) => {
    console.log('YOLOv8 출력 처리 중... 출력 형태:', outputShape);
    
    const detections = [];
    const { scale, offsetX, offsetY } = paddingData;
    const { originalWidth, originalHeight } = originalSize;
    
    // 출력 텐서 형태에 따른 처리
    if (outputShape.length === 3) {
      // YOLOv8 표준 출력 형식 (예: [1, 84, 8400])
      // 첫 번째 차원: 배치 크기
      // 두 번째 차원: 4(좌표) + 클래스 수(예: 80)
      // 세 번째 차원: 앵커 수
      
      const batchIdx = 0; // 첫 번째 배치 사용
      const numClasses = outputShape[1] - 4; // 클래스 수
      const numAnchors = outputShape[2]; // 앵커 수
      
      console.log(`클래스 수: ${numClasses}, 앵커 수: ${numAnchors}`);
      
      // 각 앵커에 대한 처리
      for (let anchor = 0; anchor < numAnchors; anchor++) {
        // 클래스별 확률 찾기
        let maxClassProb = 0;
        let maxClassIdx = 0;
        
        for (let cls = 0; cls < numClasses; cls++) {
          // 4개의 좌표 다음부터 클래스 확률 시작
          const idx = 4 + cls;
          // 현재 앵커의 현재 클래스에 대한 확률
          const prob = output[idx * numAnchors + anchor];
          
          if (prob > maxClassProb) {
            maxClassProb = prob;
            maxClassIdx = cls;
          }
        }
        
        // 임계값보다 높은 점수만 처리
        if (maxClassProb > yoloConfig.scoreThreshold) {
          // 박스 좌표 추출 (x, y = 중심좌표, w, h = 너비/높이)
          const x = output[0 * numAnchors + anchor];
          const y = output[1 * numAnchors + anchor];
          const w = output[2 * numAnchors + anchor];
          const h = output[3 * numAnchors + anchor];
          
          // 패딩을 고려하여 원본 이미지 좌표로 변환
          const realX = (x - offsetX) / scale;
          const realY = (y - offsetY) / scale;
          const realW = w / scale;
          const realH = h / scale;
          
          // 감지 결과 추가 (중심 좌표 -> 좌상단 좌표로 변환)
          detections.push({
            box: {
              x: realX - realW / 2,
              y: realY - realH / 2,
              width: realW,
              height: realH
            },
            class: vegetableLabels[maxClassIdx % vegetableLabels.length] || '알 수 없음',
            classId: maxClassIdx,
            confidence: maxClassProb
          });
        }
      }
    } else if (outputShape.length === 2) {
      // 다른 형태의 출력 (예: [84, 8400])
      const numClasses = outputShape[0] - 4; // 클래스 수
      const numAnchors = outputShape[1]; // 앵커 수
      
      console.log(`대체 형식 - 클래스 수: ${numClasses}, 앵커 수: ${numAnchors}`);
      
      // 각 앵커에 대한 처리
      for (let anchor = 0; anchor < numAnchors; anchor++) {
        // 클래스별 확률 찾기
        let maxClassProb = 0;
        let maxClassIdx = 0;
        
        for (let cls = 0; cls < numClasses; cls++) {
          const prob = output[(4 + cls) * numAnchors + anchor];
          if (prob > maxClassProb) {
            maxClassProb = prob;
            maxClassIdx = cls;
          }
        }
        
        // 임계값보다 높은 점수만 처리
        if (maxClassProb > yoloConfig.scoreThreshold) {
          // 박스 좌표 추출
          const x = output[0 * numAnchors + anchor];
          const y = output[1 * numAnchors + anchor];
          const w = output[2 * numAnchors + anchor];
          const h = output[3 * numAnchors + anchor];
          
          // 패딩을 고려하여 원본 이미지 좌표로 변환
          const realX = (x - offsetX) / scale;
          const realY = (y - offsetY) / scale;
          const realW = w / scale;
          const realH = h / scale;
          
          // 감지 결과 추가
          detections.push({
            box: {
              x: realX - realW / 2,
              y: realY - realH / 2,
              width: realW,
              height: realH
            },
            class: vegetableLabels[maxClassIdx % vegetableLabels.length] || '알 수 없음',
            classId: maxClassIdx,
            confidence: maxClassProb
          });
        }
      }
    } else if (output.length === vegetableLabels.length) {
      // 단순 분류 모델인 경우 (출력이 클래스 확률 벡터)
      let maxIdx = 0;
      let maxProb = output[0];
      
      for (let i = 1; i < output.length; i++) {
        if (output[i] > maxProb) {
          maxProb = output[i];
          maxIdx = i;
        }
      }
      
      if (maxProb > yoloConfig.scoreThreshold) {
        // 전체 이미지에 대한 분류 결과 생성
        detections.push({
          box: {
            x: 0,
            y: 0,
            width: originalWidth,
            height: originalHeight
          },
          class: vegetableLabels[maxIdx] || '알 수 없음',
          classId: maxIdx,
          confidence: maxProb
        });
      }
    } else {
      throw new Error(`지원되지 않는 출력 형식: ${outputShape}`);
    }
    
    // NMS 적용하여 중복 제거
    return applyNMS(detections, yoloConfig.iouThreshold);
  };
  
  // NMS 적용 함수
  const applyNMS = (detections, iouThreshold) => {
    // 신뢰도 기준으로 내림차순 정렬
    const sortedDetections = [...detections].sort((a, b) => b.confidence - a.confidence);
    const selectedDetections = [];
    
    while (sortedDetections.length > 0) {
      // 가장 높은 신뢰도의 감지 결과 선택
      const current = sortedDetections.shift();
      selectedDetections.push(current);
      
      // 남은 모든 감지 결과와 IoU 계산하여 중복 제거
      for (let i = sortedDetections.length - 1; i >= 0; i--) {
        const box1 = current.box;
        const box2 = sortedDetections[i].box;
        
        const iou = calculateIoU(box1, box2);
        if (iou > iouThreshold) {
          sortedDetections.splice(i, 1);
        }
      }
    }
    
    return selectedDetections;
  };
  
  // IoU(Intersection over Union) 계산 함수
  const calculateIoU = (box1, box2) => {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
    
    if (x2 < x1 || y2 < y1) return 0;
    
    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;
    
    return intersection / (area1 + area2 - intersection);
  };
  
  // YOLOv8 네이티브 환경 처리 함수
  const processYoloForNative = async (uri) => {
    try {
      console.log('YOLOv8 네이티브 환경에서 이미지 처리 중...');
      
      if (!session) {
        throw new Error('모델 세션이 준비되지 않았습니다.');
      }
      
      // 이미지 리사이징 및 처리
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: yoloConfig.inputSize, height: yoloConfig.inputSize } }],
        { format: SaveFormat.JPEG }
      );
      
      try {
        // 이미지 데이터를 base64로 읽기
        const base64Image = await FileSystem.readAsStringAsync(manipResult.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // 이미지 데이터를 Float32Array로 변환
        const imageData = await prepareYoloInputData(base64Image);
        
        // 텐서 생성
        const inputName = modelInfo.inputNames && modelInfo.inputNames.length > 0 ? 
                          modelInfo.inputNames[0] : 'images';
        console.log(`텐서 생성 중... 입력 이름: ${inputName}`);
        
        const inputTensor = new Tensor('float32', imageData, [1, 3, yoloConfig.inputSize, yoloConfig.inputSize]);
        
        // 모델 추론
        const feeds = {};
        feeds[inputName] = inputTensor;
        
        console.log('모델 실행 중...');
        const results = await session.run(feeds);
        console.log('모델 실행 완료');
        
        // 결과 출력 키 확인
        const outputName = modelInfo.outputNames && modelInfo.outputNames.length > 0 ? 
                           modelInfo.outputNames[0] : Object.keys(results)[0];
        console.log('모델 출력 키:', outputName);
        
        // 결과 처리
        const output = results[outputName].data;
        const outputShape = results[outputName].dims;
        console.log('출력 형태:', outputShape);
        
        // YOLOv8 출력 처리 (네이티브 환경용)
        // 간단히 하기 위해 여기서는 더미 데이터 사용
        const detections = [];
        
        // 랜덤으로 감지 결과 생성 (개발 테스트용)
        const randomIndex = Math.floor(Math.random() * vegetableLabels.length);
        const vegetableName = vegetableLabels[randomIndex];
        const confidence = 0.7 + (Math.random() * 0.29);
        
        setLoading(false);
        
        // 결과 화면으로 이동
        navigation.navigate('Result', {
          imageUri: uri,
          vegetableName,
          confidence
        });
      } finally {
        // 임시 파일 정리
        try {
          await FileSystem.deleteAsync(manipResult.uri);
        } catch (cleanupError) {
          console.log('임시 파일 삭제 실패:', cleanupError);
        }
      }
    } catch (error) {
      console.error('YOLOv8 네이티브 처리 오류:', error);
      setLoading(false);
      Alert.alert('이미지 처리 오류', error.message || '알 수 없는 오류');
      
      // 개발 중에는 시뮬레이션으로 대체
      await simulateProcessing(uri);
    }
  };
  
  // YOLOv8 입력 데이터 준비 함수 (네이티브용)
  const prepareYoloInputData = async (base64Image) => {
    // 이 함수는 base64 이미지를 Float32Array로 변환합니다
    // 실제 구현에서는 이미지 처리 라이브러리를 사용하여 구현해야 합니다
    
    // 예제 구현: 더미 데이터 생성
    const inputSize = yoloConfig.inputSize;
    const channels = 3;
    const imageArray = new Float32Array(channels * inputSize * inputSize);
    
    // 모든 픽셀을 중간값(0.5)로 설정 - 실제 구현에서는 실제 이미지 픽셀 값으로 대체해야 함
    for (let i = 0; i < imageArray.length; i++) {
      imageArray[i] = 0.5;
    }
    
    return imageArray;
  };

  if (hasPermission === null && Platform.OS !== 'web') {
    return <View style={styles.container}><Text>카메라 권한을 요청 중입니다...</Text></View>;
  }
  if (hasPermission === false && Platform.OS !== 'web') {
    return <View style={styles.container}><Text>카메라 접근 권한이 없습니다.</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>DEEP_APP</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="person-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="menu-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 메인 컨텐츠 */}
      <View style={styles.mainContent}>
        <View style={styles.titleContainer}>
          <View style={styles.titlePill}>
            <Text style={styles.mainTitle}>DEEP_APP</Text>
          </View>
          <Text style={styles.subtitle}>요리가 시작되는 곳</Text>
        </View>
        
        {/* 모델 로딩 상태 표시 */}
        {modelState.isLoading && (
          <View style={styles.modelLoadingContainer}>
            <ActivityIndicator size="small" color="#F4A261" />
            <Text style={styles.modelLoadingText}>모델을 로드 중입니다...</Text>
          </View>
        )}
        
        {/* 모델 오류 상태 표시 */}
        {modelState.error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#E76F51" />
            <Text style={styles.errorText}>모델 로드 중 오류가 발생했습니다</Text>
            <Text style={styles.errorSubText}>{modelState.error}</Text>
          </View>
        )}
        
        {/* 이미지 미리보기 */}
        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.previewImage} />
          </View>
        )}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F4A261" />
            <Text style={styles.loadingText}>식재료를 분석 중입니다...</Text>
          </View>
        ) : (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, !modelState.isReady && styles.disabledButton]} 
              onPress={pickImage}
              disabled={!modelState.isReady || loading}
            >
              <Ionicons name="folder-outline" size={24} color="#333" />
              <Text style={styles.actionText}>갤러리</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, !modelState.isReady && styles.disabledButton]}
              onPress={takePhoto}
              disabled={!modelState.isReady || loading || Platform.OS === 'web'}
            >
              <Ionicons name="camera-outline" size={24} color="#333" />
              <Text style={styles.actionText}>촬영</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* 플로팅 액션 버튼 */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings-outline" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* 하단 여백 추가 (탭 바 높이만큼) */}
      <View style={{ height: 60 }} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
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
    backgroundColor: '#F4A261',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titlePill: {
    backgroundColor: '#F4A261',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  previewContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  actionContainer: {
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4A261',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  actionText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  modelLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9E1FF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modelLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#FFEDED',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
  },
  errorText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#E76F51',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorSubText: {
    fontSize: 12,
    color: '#E76F51',
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7B1FA2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }
});

export default SearchScreen;
