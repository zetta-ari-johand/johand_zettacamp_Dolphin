const bookPurchaseList = [];
let totalMoneySpent = 0;

function addBookToListPurchased(book) {
  bookPurchaseList.push(book);
}

// calculate amount payment per month
function calculateDueDates(creditTerm, totalPrice) {
  const currentDate = new Date();
  const currentDay = currentDate.getDate();

  const monthlyPayment = Math.floor(totalPrice / creditTerm);
  const remainder = totalPrice % creditTerm;

  let dueDates = []; // Declare dueDates as an empty array

  let previousAmountPaid = 0; // Initialize previousAmountPaid

  dueDates = Array.from({ length: creditTerm }, (_, i) => {
    const futureDate = new Date(currentDate);
    const lastDayOfNextMonth = new Date(futureDate.getFullYear(), futureDate.getMonth() + 2, 0).getDate();
    const dueDay = currentDay <= lastDayOfNextMonth ? currentDay : lastDayOfNextMonth;

    futureDate.setMonth(futureDate.getMonth() + 1);
    futureDate.setDate(dueDay);

    currentDate.setMonth(currentDate.getMonth() + 1);

    // Calculate the amount paid for this term
    const termPayment = i === creditTerm - 1 ? monthlyPayment + remainder : monthlyPayment;

    // calculate the amount paid, which accumulates with each term
    const amountPaid = previousAmountPaid + termPayment;

    previousAmountPaid = amountPaid; // update previousAmountPaid

    return {
      term: i + 1,
      date: dueDay,
      month: futureDate.toLocaleDateString('id-ID', { month: 'long' }),
      year: futureDate.getFullYear(),
      totalLoan: totalPrice,
      amountPaid: amountPaid,
      amountPerTerm: termPayment,
      remainingBalance: totalPrice - amountPaid,
    };
  });

  return dueDates;
}

// function calculateDueDates(creditTerm, totalPrice) {
//   const currentDate = new Date(); // store date variable to
//   const currentDay = currentDate.getDate(); // get date

//   const monthlyPayment = totalPrice / creditTerm; // get monthly amount payment
//   let remainingBalance = totalPrice; // store totalprice as new variable to use later

//   // create new array from credit_term, the length is from credit term. if creditterm == 3, length === 3
//   // _ = placeholder for element being process. using _ because its not used
//   // i = index of the current element
//   const dueDates = Array.from({ length: creditTerm }, (_, i) => {
//     // FROM IS AN ARRAY FUNCTION
//     const futureDate = new Date(currentDate); // copy current date to future date. basically have the same value
//     // calculate last day of next month
//     const lastDayOfNextMonth = new Date(futureDate.getFullYear(), futureDate.getMonth() + 2, 0).getDate();
//     const dueDay = currentDay <= lastDayOfNextMonth ? currentDay : lastDayOfNextMonth;
//     // if jan jan 30 <= 29 feb, then dueDate = currentDay
//     // if sep 30 <= 31 oct, then dueDate = lastdaynextmonth

//     futureDate.setMonth(futureDate.getMonth() + 1); // month is like an array. start from 0´
//     futureDate.setDate(dueDay);

//     currentDate.setMonth(currentDate.getMonth() + 1);

//     // ------------- PAYMENT ---------------
//     const payment = {
//       term: i + 1,
//       date: dueDay,
//       month: futureDate.toLocaleDateString('id-ID', { month: 'long' }),
//       year: futureDate.getFullYear(),
//       totalLoan: totalPrice,
//       amountPaid: totalPrice - (remainingBalance - monthlyPayment), // formula to count amoun  that has been paid
//       amountPerTerm: monthlyPayment,
//       remainingBalance: remainingBalance - monthlyPayment,
//     };

//     remainingBalance -= monthlyPayment; // decrease the remaining loan amount per term

//     return payment;
//   });

//   return dueDates;
// }

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

  const totalPrice = numToPurchase * priceAfterTax;

  const dueDates = calculateDueDates(creditTerm, totalPrice);

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
purchaseBook('The Lord of the Rings', 'J.R.R Tolkien', 10000, 10, 8, 1, 2, 3);
console.log('------------------------');

console.log(bookPurchaseList);
console.log('------------------------');
