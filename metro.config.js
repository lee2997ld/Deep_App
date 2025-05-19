const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');

const config = getDefaultConfig(__dirname);

// 에셋 확장자 추가
config.resolver.assetExts.push("onnx", "ttf");

// 누락된 에셋 경로 문제 해결
config.resolver.extraNodeModules = {
  'missing-asset-registry-path': path.resolve(__dirname, 'assets'),
  ...config.resolver.extraNodeModules,
};

// 에셋 처리를 위한 변환기 설정
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
