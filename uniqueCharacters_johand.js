// FOR OF
function hasUniqueCharacters(str) {
  const charSet = new Set();

  // check each one char of str
  for (const char of str) {
    if (charSet.has(char)) {
      console.log(`the duplicate character is ${char}`);
      return false; // character is not unique
    }
    charSet.add(char);
  }

  return true; // All characters are unique
}

// console.log(hasUniqueCharacters('abcdefg'));
// console.log(hasUniqueCharacters('hello'));

// FOR LOOP
function hasUniqueCharactersForLet(str) {
  str = str.toLowerCase(); // delete if want to be more strict (lower and uppercase same chars will count as unique)
  for (let i = 0; i < str.length; i++) {
    for (let j = i + 1; j < str.length; j++) {
      if (str[i] === str[j]) {
        console.log(`the duplicate character is ${str[i]}`);
        return false; // Found a duplicate character
      }
    }
  }
  return true; // No duplicate characters found
}

console.log(hasUniqueCharactersForLet('abcdeefg'));
// console.log(hasUniqueCharactersForLet('hello'));
