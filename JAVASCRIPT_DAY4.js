const bookPurchaseList = [];
let totalMoneySpent = 0;

function addBookToListPurchased(book) {
  bookPurchaseList.push(book);
}

function purchaseBook(bookTitle, author, price, discountPercentage, taxPercentage, numToPurchase, availableStock) {
  // Check if the available stock is 0 before proceeding
  if (availableStock === 0) {
    console.log('Sorry, this book is sold out.');
    return; // stop the process
  }
  initialStock = availableStock;

  // boolean variable for is book available or sold out
  const isAvailable = true;
  // if (!isAvailable) {
  //   console.log('Sorry, this book is sold out.');
  //   return;
  // }

  const available = isAvailable ? 'Yes' : 'Sold Out';

  // Declare discountAmount before the loop
  const discountAmount = (price * discountPercentage) / 100;

  // Calculate the price after discount
  const priceAfterDiscount = price - discountAmount;

  // Calculate the amount of tax
  const taxAmount = (priceAfterDiscount * taxPercentage) / 100;

  // Calculate the price after tax
  const priceAfterTax = priceAfterDiscount + taxAmount;

  for (let i = 0; i < numToPurchase; i++) {
    if (availableStock === 0) {
      console.log(
        `There's only ${initialStock} remaining stock of this book, but you've successfully bought all the remaining ${initialStock} stock of:`
      );
      break; // stop the loop if there are no more copies available
    }

    totalMoneySpent += priceAfterTax;
    availableStock--;

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
      totalMoneySpent,
    };

    addBookToListPurchased(purchase);
  }
  if (availableStock >= 1)
    console.log(
      `You've bought ${numToPurchase} copies of ${bookTitle}. There's still ${availableStock} remaining stock you can buy again.`
    );

  // Display the details and calculations for the last purchased book
  console.log('Book Title:', bookTitle);
  console.log('Author:', author);
  console.log('Price per Book:', price + ' Rupiah');
  console.log('Available:', available);
  console.log('Discount Percentage:', discountPercentage + '%');
  console.log('Tax Percentage:', taxPercentage + '%');
  console.log('Amount of Discount:', discountAmount + ' Rupiah');
  console.log('Price After Discount:', priceAfterDiscount + ' Rupiah');
  console.log('Amount of Tax:', taxAmount + ' Rupiah');
  console.log('Price After Tax:', priceAfterTax + ' Rupiah');
  console.log('Total Money Spent:', totalMoneySpent + ' Rupiah');
  console.log('Available Stock:', availableStock);
}

// bookTitle, author, price, discountPercentage, taxPercentage, numToPurchase, availableStock
purchaseBook('The Lord of the Rings', 'J.R.R Tolkien', 100000, 10, 8, 1, 0);
console.log('------------------------');

console.log(bookPurchaseList);
console.log('------------------------');
