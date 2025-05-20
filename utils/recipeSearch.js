// utils/recipeSearch.js
import { parseIngredients } from './csvParser';

/**
 * 입력된 재료를 모두 포함하는 레시피를 검색
 * @param {Array} recipes - 전체 레시피 데이터
 * @param {Array} ingredients - 검색할 재료 배열 ['감자', '양파', ...]
 * @returns {Array} - 검색 조건에 맞는 레시피 배열
 */
export const searchRecipesByIngredients = (recipes, ingredients) => {
  if (!recipes || !ingredients || ingredients.length === 0) {
    return [];
  }
  
  const searchTerms = ingredients.map(ing => ing.toLowerCase().trim());
  
  return recipes.filter(recipe => {
    // 레시피의 재료 목록 추출 및 정규화
    const recipeIngredients = parseIngredients(recipe.ingredients)
      .map(item => item.name.toLowerCase());
    
    // 검색어의 재료가 레시피에 포함되어 있는지 확인
    return searchTerms.some(term => 
      recipeIngredients.some(ingredient => ingredient.includes(term))
    );
  });
};

/**
 * 검색된 레시피를 관련성에 따라 정렬
 * @param {Array} recipes - 검색된 레시피 배열
 * @param {Array} ingredients - 검색한 재료 배열
 * @returns {Array} - 정렬된 레시피 배열
 */
export const sortRecipesByRelevance = (recipes, ingredients) => {
  const searchTerms = ingredients.map(ing => ing.toLowerCase().trim());
  
  return [...recipes].sort((a, b) => {
    const aIngredients = parseIngredients(a.ingredients)
      .map(item => item.name.toLowerCase());
    
    const bIngredients = parseIngredients(b.ingredients)
      .map(item => item.name.toLowerCase());
    
    // 포함된 검색 재료 수 계산
    const aMatchCount = searchTerms.filter(term => 
      aIngredients.some(ingredient => ingredient.includes(term))
    ).length;
    
    const bMatchCount = searchTerms.filter(term => 
      bIngredients.some(ingredient => ingredient.includes(term))
    ).length;
    
    // 매칭된 재료가 많은 레시피를 상위에 표시
    if (bMatchCount !== aMatchCount) {
      return bMatchCount - aMatchCount;
    }
    
    // 매칭 수가 같으면 재료 수가 적은 레시피를 상위에 표시 (더 간단한 요리)
    return aIngredients.length - bIngredients.length;
  });
};
