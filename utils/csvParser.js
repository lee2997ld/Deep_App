// utils/csvParser.js
import { Platform } from 'react-native';

// 플랫폼에 따라 적절한 파일 시스템 모듈 가져오기
let RNFS = null;
if (Platform.OS !== 'web') {
  RNFS = require('react-native-fs');
}

// CSV 파일 로드 함수
export const loadCSVData = async (fileName) => {
  try {
    let csvData = '';
    
    // 웹 환경에서는 fetch 사용
    if (Platform.OS === 'web') {
      const response = await fetch(`${process.env.PUBLIC_URL}/assets/${fileName}`);
      if (!response.ok) {
        throw new Error('CSV 파일을 찾을 수 없습니다');
      }
      csvData = await response.text();
    } 
    // 네이티브 환경에서는 react-native-fs 사용
    else {
      let filePath;
      if (Platform.OS === 'android') {
        filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      } else if (Platform.OS === 'ios') {
        filePath = `${RNFS.MainBundlePath}/${fileName}`;
      }
      csvData = await RNFS.readFile(filePath, 'utf8');
    }
    
    // CSV 파싱
    const rows = csvData.split('\n');
    const headers = rows[0].split(',').map(header => header.trim());
    
    const data = [];
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;
      
      const values = rows[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      if (values.length > 0) {
        const rowData = {};
        values.forEach((value, index) => {
          if (index < headers.length) {
            rowData[headers[index]] = value.replace(/^"|"$/g, '').trim();
          }
        });
        data.push(rowData);
      }
    }
    
    return data;
  } catch (error) {
    console.error('데이터 로드 오류:', error);
    throw error;
  }
};
