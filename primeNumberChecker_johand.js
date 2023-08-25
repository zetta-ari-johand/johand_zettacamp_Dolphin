// REGULAR FUNCTION
function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    // efficient to skip multiple 2 and 3. so 5 - 11 - 17
    // keep loop as long as i * i <= n
    if (n % i === 0 || n % (i + 2) === 0) return false; // i + 2 to skip multiple of 2 to be more efficient
  }
  return true;
}

console.log(isPrime(10), '1ST FUNCTION');
console.log(isPrime(119), '1ST FUNCTION');

// ARROW FUNCTION
const isPrimeArrow = (n, divider = 2) => {
  if (n <= 1) return false; // prime number must be greater than 1
  if (n <= 3) return true; // 2 and 3 is prime number, 1 less than 3, but already handle it at the code above
  if (n % divider === 0) return false; // if its divided by 2 (default), not a prime number.
  if (divider * divider > n) return true;
  return isPrimeArrow(n, divider + 1); // recursive because the condition above did not met
};

console.log(isPrimeArrow(10), '2ND FUNCTION');
console.log(isPrimeArrow(43), '2ND FUNCTION');
