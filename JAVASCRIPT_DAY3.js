const bookPurchaseList = [];
let totalMoneySpent = 0;

function addBookToListPurchased(book) {
  bookPurchaseList.push(book);
}

function purchaseBook(bookTitle, author, price, discountPercentage, taxPercentage) {
  // boolean variable for is book available or sold out
  const isAvailable = true;
  //   if (!isAvailable) return false; // stop the process here if not available
  if (!isAvailable) {
    console.log('Sorry, this book is sold out.');
    return; // Stop the function here
  }
  const available = isAvailable === true ? 'Yes' : 'Sold Out';

  // calculate the amount of discount
  const discountAmount = (price * discountPercentage) / 100;

  // Calculate the price after discount
  const priceAfterDiscount = price - discountAmount;

  // Calculate the amount of tax
  const taxAmount = (priceAfterDiscount * taxPercentage) / 100;

  // Calculate the price after tax
  const priceAfterTax = priceAfterDiscount + taxAmount;

  // Calculate the average price after each purchase
  // const averagePrice = totalMoneySpent / bookPurchaseList.length;
  const averagePrice = bookPurchaseList.length === 0 ? priceAfterTax : totalMoneySpent / bookPurchaseList.length;

  const purchase = {
    bookTitle,
    author,
    price,
    discountPercentage,
    taxPercentage,
    discountAmount,
    priceAfterDiscount,
    taxAmount,
    priceAfterTax,
  };
  //   bookPurchaseList.push(purchase);
  addBookToListPurchased(purchase);
  totalMoneySpent += priceAfterTax;

  // Display the details and calculations
  console.log('Book Title:', bookTitle);
  console.log('Author:', author);
  console.log('Price:', price + ' Rupiah');
  console.log('Available:', available);
  console.log('Discount Percentage:', discountPercentage + '%');
  console.log('Tax Percentage:', taxPercentage + '%');
  console.log('Amount of Discount:', discountAmount + ' Rupiah');
  console.log('Price After Discount:', priceAfterDiscount + ' Rupiah');
  console.log('Amount of Tax:', taxAmount + ' Rupiah');
  console.log('Price After Tax:', priceAfterTax + ' Rupiah');
  console.log('Average Price:', averagePrice + ' Rupiah');
  console.log('Total Money Spent:', totalMoneySpent + ' Rupiah');
  return totalMoneySpent;
}

// Example usage:
purchaseBook('The Lord of the Rings', 'J.R.R Tolkien', 399000, 10, 8);
console.log('------------------------');
purchaseBook('Harry Potter', 'JK Rowling', 299000, 10, 8);
// console.log(purchaseBook('The Lord of the Rings', 'J.R.R Tolkien', 399000, 10, 8));

console.log(bookPurchaseList);
