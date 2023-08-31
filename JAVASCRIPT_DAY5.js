const bookPurchaseList = [];
let totalMoneySpent = 0;

function addBookToListPurchased(book) {
  bookPurchaseList.push(book);
}

function calculateDueDates(creditTerm) {
  const currentDate = new Date(); // store date to new ba
  const currentDay = currentDate.getDate(); // get current day

  // create new array from credit_term, the length is from credit term. if creditterm == 3, length === 3
  // _ = placeholder for element being process. using _ because its not used
  // i = index of the current element
  const dueDates = Array.from({ length: creditTerm }, (_, i) => {
    const futureDate = new Date(currentDate); // copy current date to future date. basically have the same value
    // calculate last day of next month
    const lastDayOfNextMonth = new Date(futureDate.getFullYear(), futureDate.getMonth() + 2, 0).getDate(); // 2 to move to next month, 0 to reset the day
    const dueDay = currentDay <= lastDayOfNextMonth ? currentDay : lastDayOfNextMonth;
    // if jan jan 30 <= 29 feb, then dueDate = currentDay
    // if sep 30 <= 31 oct, then dueDate = lastdaynextmonth

    futureDate.setMonth(futureDate.getMonth() + 1); // month is like an array. start from 0
    futureDate.setDate(dueDay);

    currentDate.setMonth(currentDate.getMonth() + 1);

    return {
      term: i + 1,
      days: dueDay,
      month: futureDate.toLocaleDateString('id-ID', { month: 'long' }),
      year: futureDate.getFullYear(),
    };
  });

  return dueDates;
}

function purchaseBook(bookTitle, author, price, discountPercentage, taxPercentage, numToPurchase, availableStock, creditTerm) {
  // Check if the available stock is 0 before proceeding
  if (availableStock === 0) {
    console.log('Sorry, this book is sold out.');
    return; // stop the process
  }
  initialStock = availableStock;

  // boolean variable for is book available or sold out
  const isAvailable = true;

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

  const dueDates = calculateDueDates(creditTerm);

  //   // default loan term options
  //   const loanTerms = [3, 6, 12];

  //   // calculate due dates for each loan term option
  //   const dueDatesByTerm = {};
  //   for (const term of loanTerms) {
  //     dueDatesByTerm[term] = calculateDueDates(term);
  //   }

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
  console.log('Due Dates:', dueDates);
}

// bookTitle, author, price, discountPercentage, taxPercentage, numToPurchase, availableStock, creditTerm
purchaseBook('The Lord of the Rings', 'J.R.R Tolkien', 100000, 10, 8, 2, 2, 10);
console.log('------------------------');

console.log(bookPurchaseList);
console.log('------------------------');
