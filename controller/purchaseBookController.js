async function simulateBackgroundProcess() {
  // console.log('this line is inside func but outside func');
  for (let i = 0; i < 5; i++) {
    console.log(`Iteration ${i + 1}: simsalabim, muncullah text`);
    // make a new promise that is still pending
    // await to make the promise resolve completly
    await new Promise((resolve) => setTimeout(resolve, 2000)); // pause for 2 seconds
  }
  // console.log('after await new promise in func loop');
}
const bookPurchaseList = [];

console.log('this line is dikucilkan --------------');

function addBookToListPurchased(book) {
  bookPurchaseList.push(book);
}

async function calculateDueDates(creditTerm, totalPrice, additionalPrice) {
  // set date
  const currentDate = new Date();
  const currentDay = currentDate.getDate();

  // set loan amount
  const monthlyPayment = Math.floor(totalPrice / creditTerm); // to round the loan amount (3333.33333 -> 3333) ROUND
  const remainder = totalPrice % creditTerm; // to make sure the total amount is the same

  let termAmounts = new Set(); // SETIMPLEMENT store distinct term amounts, ROUND
  let dueDatesMap = new Map(); // MAPIMPLEMENT store data in a Map

  // Function to format date as dd-mm-yyyy
  async function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  let amountPaid = 0; // initialize amount paid

  // calculate due dates and populate the Map
  for (let i = 0; i < creditTerm; i++) {
    const futureDate = new Date(currentDate);
    const lastDayOfNextMonth = new Date(futureDate.getFullYear(), futureDate.getMonth() + 2, 0).getDate();
    const dueDay = currentDay <= lastDayOfNextMonth ? currentDay : lastDayOfNextMonth;

    futureDate.setMonth(futureDate.getMonth() + 1);
    futureDate.setDate(dueDay);

    currentDate.setMonth(currentDate.getMonth() + 1);

    // ternary to determine term payment
    const termPayment = i === creditTerm - 1 ? monthlyPayment + remainder + additionalPrice : monthlyPayment; // ROUND, calcuate the total on the last term
    amountPaid += termPayment;

    termAmounts.add(termPayment); // add value to termAmount set SETIMPLEMENT. value is object but unique

    const formattedDate = await formatDate(futureDate);

    // MAPIMPLEMENT set object to map.
    // first param is date as keys, 2nd is object valu
    dueDatesMap.set(formattedDate, {
      term: i + 1,
      date: formattedDate,
      totalLoan: totalPrice,
      amountPaid: amountPaid,
      amountPerTerm: termPayment,
      additionalPrice: `${additionalPrice} will be added at the last month of the loan`,
    });
  }

  // console.log(termAmounts); // {3333, 3334}
  // console.log(Array.from(termAmounts)); // [3333, 3334]
  return { dueDates: dueDatesMap, distinctTermAmounts: Array.from(termAmounts) }; // SETIMPLEMENT. Array.from to convert from object to arr
}

async function purchaseBook(
  bookTitle,
  author,
  price,
  discountPercentage,
  taxPercentage,
  numToPurchase,
  availableStock,
  creditTerm,
  additionalPrice,
  specificDate // MAPIMPLEMENT
) {
  const messages = [];

  if (availableStock === 0) {
    messages.push(`Sorry, this book is sold out.`);
    return {
      status: false,
      message: 'Sorry, this book is sold out.',
    };
  }

  if (availableStock === numToPurchase) {
    messages.push(`Congrats you've bought all the remaining book stock`);
  }

  let initialStock = availableStock;
  let isAvailable = true;
  const available = isAvailable ? 'Yes' : 'Sold Out';

  const discountAmount = (price * discountPercentage) / 100;
  const priceAfterDiscount = price - discountAmount;
  const taxAmount = (priceAfterDiscount * taxPercentage) / 100;
  const priceAfterTax = priceAfterDiscount + taxAmount;

  let totalMoneySpent = 0;

  for (let i = 0; i < numToPurchase; i++) {
    if (availableStock === 0) {
      messages.push(
        `There's only ${initialStock} remaining stock of this book, but you've successfully bought all the remaining ${initialStock} stock of: ${bookTitle}`
      );
      break;
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

  if (availableStock >= 1) {
    messages.push(
      `You've bought ${numToPurchase} copies of ${bookTitle}. There's still ${availableStock} remaining stock you can buy again.`
    );
  }

  const totalPrice = totalMoneySpent;

  const dueDatesResponse = await calculateDueDates(creditTerm, totalPrice, additionalPrice);

  const response = {
    status: true,
    messages,
    distinctTermAmounts: dueDatesResponse.distinctTermAmounts, // SETIMPLEMENT
  };

  // MAPIMPLEMENT
  if (specificDate && dueDatesResponse.dueDates.has(specificDate)) {
    response.specificTerm = dueDatesResponse.dueDates.get(specificDate);
  } else {
    response.specificTerm = { message: 'No payment for this date' };
  }

  // asign the dueDates Map to allTerms
  // convert map to object
  response.allTerms = Object.fromEntries(dueDatesResponse.dueDates); // MAPIMPLEMENT

  return response;
}

module.exports = {
  purchaseBook: async (req, res, next) => {
    try {
      const {
        bookTitle,
        author,
        price,
        discountPercentage,
        taxPercentage,
        numToPurchase,
        availableStock,
        creditTerm,
        additionalPrice,
        specificDate,
      } = req.body;
      const requiredValues = ['bookTitle', 'author', 'specificDate'];
      const numericValues = [
        'price',
        'discountPercentage',
        'taxPercentage',
        'numToPurchase',
        'availableStock',
        'creditTerm',
        'additionalPrice',
      ];

      // Check for missing required fields
      for (const requiredValue of requiredValues) {
        if (!req.body[requiredValue]) {
          return res.status(422).json({
            message: `${requiredValue} is missing`,
          });
        }
      }

      // Check for numeric fields (not missing, null, or undefined)
      for (const field of numericValues) {
        if (req.body[field] === undefined || req.body[field] === null) {
          return res.status(422).json({
            message: `${field} must not be empty`,
          });
        }
      }

      const purchaseResponse = await purchaseBook(
        bookTitle,
        author,
        price,
        discountPercentage,
        taxPercentage,
        numToPurchase,
        availableStock,
        creditTerm,
        additionalPrice,
        specificDate // pass specificDate to the purchaseBook function
      );

      if (purchaseResponse) {
        return res.status(200).json({
          status: true,
          response: purchaseResponse,
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Book purchase failed',
        });
      }
    } catch (error) {
      res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },

  loopWithAwait: async (req, res, next) => {
    // simple way
    console.log('endpoint 1: Before calling asynchronous function'); // execute first
    await simulateBackgroundProcess(); // execute 2nd and wait for the loop func operation completed
    console.log('endpoint 1: After calling asynchronous function'); // execute 3rd
    return res.status(200).json({
      // exuecute last after all ops completed
      status: true,
      message: 'Thats all folks for calling with await',
    });

    // ribet way
    // new Promise((resolve, reject) => {
    //   console.log('Endpoint 1: Before calling asynchronous function');
    //   simulateBackgroundProcess()
    //     .then(() => {
    //       console.log('Endpoint 1: After calling asynchronous function');
    //       resolve();
    //     })
    //     .catch((error) => {
    //       console.error('An error occurred:', error);
    //       reject(error);
    //     });
    // })
    //   .then(() => {
    //     return res.status(200).json({
    //       status: true,
    //       message: 'Thats all folks for calling with await',
    //     });
    //   })
    //   .catch((error) => {
    //     return res.status(500).json({
    //       status: false,
    //       message: 'error occurred in the Promise: ' + error.message,
    //     });
    //   });

    /* 
    Endpoint 1: Before calling asynchronous function
    Iteration 1: simsalabim, muncullah text
    Iteration 2: simsalabim, muncullah text
    Iteration 3: simsalabim, muncullah text
    Iteration 4: simsalabim, muncullah text
    Iteration 5: simsalabim, muncullah text
    Endpoint 1: After calling asynchronous function
    */
  },

  loopWithoutAwait: async (req, res, next) => {
    console.log('endpoint 2: Before calling asynchronous function'); // execute first
    simulateBackgroundProcess(); // 2nd, first increment
    console.log('endpoint 2: After calling asynchronous function');
    // 3rd
    return res.status(200).json({
      status: true,
      message: 'Thats all folks for calling without await',
    });

    /*
    Endpoint 2: Before calling asynchronous function
    Iteration 1: simsalabim, muncullah text
    Endpoint 2: After calling asynchronous function
    Iteration 2: simsalabim, muncullah text
    Iteration 3: simsalabim, muncullah text
    Iteration 4: simsalabim, muncullah text
    Iteration 5: simsalabim, muncullah text
    */
  },
};
