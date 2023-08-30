function majorityElement2(nums) {
  const countMap = new Map(); // create empty map

  for (const num of nums) {
    // set is a method  from map. to set pair of key-value
    countMap.set(num, (countMap.get(num) || 0) + 1);
  }

  // First iteration: num = 3
  // countMap: {3: 1} (3 appears once)
  // Second iteration: num = 2
  // countMap: {3: 1, 2: 1} (2 appears once)
  // Third iteration: num = 3
  // since 3 already exists in the map, increment its count.
  // countMap: {3: 2, 2: 1} (3 appears twice)

  let majorityElement;
  let maxCount = 0;

  for (const [num, count] of countMap) {
    if (count > maxCount) {
      majorityElement = num;
      maxCount = count;
    }
  }
  console.log(countMap);

  return majorityElement;
}
console.log(majorityElement2([3, 2, 3])); // Output: 3

console.log(majorityElement2([2, 2, 1, 1, 1, 2, 2])); // Output: 2
