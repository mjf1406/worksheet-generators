function findSmallestDivisor(num) {
    for (let i = 2; i <= num; i++) {
        if (num % i === 0) return i
    }
    return num // If number is prime
}
function findLargestDivisor(num){
    const smallestDivisor = findSmallestDivisor(num)
    return num / smallestDivisor
}
function computeWordStatistics(wordsArray){
    let cleanedWordsArray = wordsArray.map(word => {
        return word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    });
    const avgLength = computeAverageLength(cleanedWordsArray)
    const longestWord = findLongestElement(cleanedWordsArray)
    const shortestWord = findShortestElement(cleanedWordsArray)
    const wordCount = wordsArray.length
    if (wordCount > 32) makeToast(`The maximum number of words is <b>${WORD_SEARCH_MAX_WORDS}</b>, you have <b>${wordCount}</b>`,'warning')
    return {avgLength: avgLength, longestWord: longestWord, wordCount: wordCount, shortestWord: shortestWord}
}
function computeAverageLength(array) {
    if (array.length === 0) {
        return 0; // Avoid division by zero
    }

    let totalLength = array.reduce((sum, element) => {
        return sum + element.length;
    }, 0);

    let averageLength = totalLength / array.length;
    return Math.round(averageLength)
}
function findLongestElement(array) {
    if (array.length === 0) return null; // Return null for an empty array
    let longestElement = array[0];
    array.forEach(element => {
        if (element.length > longestElement.length) longestElement = element;
    });
    return {element: longestElement, length: longestElement.length}
}
function findShortestElement(array) {
    if (array.length === 0) return null; // Return null for an empty array
    let longestElement = array[0];
    array.forEach(element => {
        if (element.length < longestElement.length) longestElement = element;
    });
    return {element: longestElement, length: longestElement.length}
}
function findDuplicates(array) {
    let elementCount = {};
    let duplicates = [];
    array.forEach(element => {
        elementCount[element] = (elementCount[element] || 0) + 1;
    });
    for (let element in elementCount) {
        if (elementCount[element] > 1) duplicates.push(element);
    }
    return duplicates;
}
function getRndInteger(min, max) {
    return parseInt(Math.floor(Math.random() * (max + 1 - min)) + min);
}