// const express = require('express');
// const app = express();
// const port = process.env.PORT || 3000;

// Sample purchaseBook function
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

  let dueDates = [];
  let previousAmountPaid = 0;

  dueDates = Array.from({ length: creditTerm }, (_, i) => {
    const futureDate = new Date(currentDate);
    const lastDayOfNextMonth = new Date(futureDate.getFullYear(), futureDate.getMonth() + 2, 0).getDate();
    const dueDay = currentDay <= lastDayOfNextMonth ? currentDay : lastDayOfNextMonth;

    futureDate.setMonth(futureDate.getMonth() + 1);
    futureDate.setDate(dueDay);

    currentDate.setMonth(currentDate.getMonth() + 1);

    const termPayment = i === creditTerm - 1 ? monthlyPayment + remainder : monthlyPayment;
    const amountPaid = previousAmountPaid + termPayment;

    previousAmountPaid = amountPaid;

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

module.exports = {
  purchaseBook: async (req, res, next) => {
    function purchaseBook(bookTitle, author, price, discountPercentage, taxPercentage, numToPurchase, availableStock, creditTerm) {
      const messages = [];

      if (availableStock === 0) {
        messages.push(`Sorry, this book is sold out.`);
        return;
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

      const totalPrice = numToPurchase * priceAfterTax;

      const dueDates = calculateDueDates(creditTerm, totalPrice);

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

    const { bookTitle, author, price, discountPercentage, taxPercentage, numToPurchase, availableStock, creditTerm } = req.body;

    const requiredValues = ['bookTitle', 'author'];
    const numericValues = ['price', 'discountPercentage', 'taxPercentage', 'numToPurchase', 'availableStock', 'creditTerm'];

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

    const purchaseResponse = purchaseBook(
      bookTitle,
      author,
      price,
      discountPercentage,
      taxPercentage,
      numToPurchase,
      availableStock,
      creditTerm
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
  },
};
