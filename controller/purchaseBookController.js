const bookPurchaseList = [];

function addBookToListPurchased(book) {
  bookPurchaseList.push(book);
}

module.exports = {
  purchaseBook: async (req, res, next) => {
    try {
      async function calculateDueDates(creditTerm, totalPrice, additionalPrice) {
        // set date
        const currentDate = new Date();
        const currentDay = currentDate.getDate();

        // set loan amount
        const monthlyPayment = Math.floor(totalPrice / creditTerm);
        const remainder = totalPrice % creditTerm;

        let dueDates = []; // store data
        let previousAmountPaid = 0; // track amount paid from beginning

        // do the calculation here
        dueDates = Array.from({ length: creditTerm }, (_, i) => {
          // set date format
          const futureDate = new Date(currentDate);
          const lastDayOfNextMonth = new Date(futureDate.getFullYear(), futureDate.getMonth() + 2, 0).getDate();
          const dueDay = currentDay <= lastDayOfNextMonth ? currentDay : lastDayOfNextMonth;

          futureDate.setMonth(futureDate.getMonth() + 1);
          futureDate.setDate(dueDay); // get date

          currentDate.setMonth(currentDate.getMonth() + 1);

          const termPayment = i === creditTerm - 1 ? monthlyPayment + remainder + additionalPrice : monthlyPayment; // term amount payment
          const amountPaid = previousAmountPaid + termPayment; // count amount paid per term

          previousAmountPaid = amountPaid; // update amount paid per term

          return {
            term: i + 1,
            date: dueDay,
            month: futureDate.toLocaleDateString('id-ID', { month: 'long' }),
            year: futureDate.getFullYear(),
            totalLoan: totalPrice,
            amountPaid: amountPaid,
            amountPerTerm: termPayment,
            additionalPrice: `${additionalPrice} will be added at the last month of the loan`,
            // remainingBalance: totalPrice - amountPaid,
          };
        });

        return dueDates;
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
        additionalPrice
      ) {
        // store message as response later
        const messages = [];

        // if theres no book since beginning
        if (availableStock === 0) {
          messages.push(`Sorry, this book is sold out.`);
          return {
            status: false,
            message: 'Sorry, this book is sold out.',
          };
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
        if (availableStock >= 1)
          messages.push(
            `You've bought ${numToPurchase} copies of ${bookTitle}. There's still ${availableStock} remaining stock you can buy again.`
          );

        // const totalPrice = numToPurchase * priceAfterTax;
        const totalPrice = totalMoneySpent;

        const dueDates = await calculateDueDates(creditTerm, totalPrice, additionalPrice);

        const response = {
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
          availableStock,
          dueDates,
          messages,
        };

        return response;
      }

      const { bookTitle, author, price, discountPercentage, taxPercentage, numToPurchase, availableStock, creditTerm, additionalPrice } =
        req.body;
      const requiredValues = ['bookTitle', 'author'];
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
        additionalPrice // Pass additionalPrice to the purchaseBook function
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
};
