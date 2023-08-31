// SOLUTION 1
function containsDuplicate(nums) {
  const numMap = new Map();

  for (const num of nums) {
    if (numMap.has(num)) {
      return true; // found a duplicate
    }
    numMap.set(num, true); // add the number to the map with a value of true
  }

  return false; // no duplicates found
}

// Example usage:
console.log(containsDuplicate([1, 2, 3, 1])); // Output: true
console.log(containsDuplicate([1, 2, 3, 4])); // Output: false
console.log(containsDuplicate([1, 1, 1, 3, 3, 4, 3, 2, 4, 2])); // Output: true

// SOLUTION 2
function containsDuplicate2(nums) {
  nums.sort(); // sort from small to big. also applied with characte

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === nums[i + 1]) {
      return true;
    }
  }
  return false;
}

console.log(containsDuplicate2([1, 2, 3, 1])); // Output: true
console.log(containsDuplicate2([1, 2, 3, 4])); // Output: false
console.log(containsDuplicate2([1, 1, 1, 3, 3, 4, 3, 2, 4, 2])); // Output: true
