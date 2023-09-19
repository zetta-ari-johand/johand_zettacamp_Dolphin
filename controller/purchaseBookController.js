const mongoose = require('mongoose');
const BookPurchaseModel = require('../models/bookModel');
const AuthorModel = require('../models/authorModel');
const BookshelvesModel = require('../models/bookShelvesModel');

const bookPurchaseList = [];

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

  createBook: async (req, res, next) => {
    try {
      const { bookTitle, author, genre, price, quantity } = req.body;
      const requiredValues = ['bookTitle', 'author', 'genre', 'price'];

      for (const requiredValue of requiredValues) {
        if (!req.body[requiredValue]) {
          return res.status(422).json({
            message: `${requiredValue} is missing`,
          });
        }
      }

      // condition to set status value into db
      let isAvailable;
      if (quantity == 0 || !quantity) {
        isAvailable = 'false';
      } else {
        isAvailable = 'true';
      }

      // data to add to db
      const bookDetail = { bookTitle, author, genre, price, quantity, status: isAvailable };
      await BookPurchaseModel.create(bookDetail); // create
      return res.status(200).json({
        status: true,
        message: 'Success insert book',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },

  // find all book or by id
  findBook: async (req, res, next) => {
    try {
      // find book by id
      // const { id } = req.query;
      // if (!id) {
      //   return res.status(422).json({
      //     status: false,
      //     message: 'Insert id of books',
      //   });
      // }
      // if (!mongoose.Types.ObjectId.isValid(id)) {
      //   return res.status(400).json({ message: 'Invalid ObjectId format' });
      // }

      // const bookData = await BookPurchaseModel.findById(id).populate('author');

      // find all
      const bookData = await BookPurchaseModel.find();
      // .populate('author');
      // to populate certain data that already has relationship

      // validation if theres no data exisiting
      if (bookData.length < 1) {
        return res.status(200).json({
          status: true,
          message: 'Theres no book. create first',
        });
      }

      return res.status(200).json({
        status: true,
        message: 'Success get book data',
        data: bookData,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },

  updateBook: async (req, res, next) => {
    try {
      const { id } = req.query;
      const updateKeyValue = req.body;
      if (!id) {
        return res.status(422).json({
          status: false,
          message: 'Insert id of books',
        });
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: 'Invalid ObjectId format',
        });
      }

      let updateData = await BookPurchaseModel.findByIdAndUpdate(id, updateKeyValue, { new: true });
      if (!updateData) {
        return res.status(400).json({
          status: true,
          message: 'No data found to be updated',
        });
      }
      return res.status(200).json({
        status: true,
        message: 'Success update book',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },

  deleteBook: async (req, res, next) => {
    try {
      // delete by id
      // const { id } = req.query;
      // if (!id) {
      //   return res.status(200).json({
      //     status: true,
      //     message: 'Missing ID of book',
      //   });
      // }
      // if (!mongoose.Types.ObjectId.isValid(id)) {
      //   return res.status(400).json({ message: 'Invalid ObjectId format' });
      // }
      // const deleteData = await BookPurchaseModel.findByIdAndDelete(id);
      // if (!deleteData) {
      //   return res.status(400).json({
      //     status: true,
      //     message: 'No books ID found',
      //   });
      // }

      // // delete by name
      const { bookTitle } = req.query;

      // filter to match documents with the specified bookTitle
      const filter = { bookTitle };

      await BookPurchaseModel.deleteMany(filter);

      return res.status(200).json({
        status: true,
        message: 'Success deleting book data',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },

  addAuthor: async (req, res, next) => {
    try {
      const { name, email, socialMedia } = req.body;
      const requiredValues = ['name', 'email', 'socialMedia'];

      for (const requiredValue of requiredValues) {
        if (!req.body[requiredValue]) {
          return res.status(422).json({
            message: `${requiredValue} is missing`,
          });
        }
      }
      const authorData = { name, email, socialMedia };
      await AuthorModel.create(authorData);
      return res.status(200).json({
        status: true,
        message: 'Success insert author',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: true,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },

  // DAY 3
  // create
  addBookShelves: async (req, res, next) => {
    try {
      // retrieve ObjectIds from BookPurchase
      const bookObjectIds = await BookPurchaseModel.find({}).select('_id');

      // retrieve genres from BookPurchase
      const genres = await BookPurchaseModel.distinct('genre');

      // create a new Bookshelves document
      const newBookshelves = await BookshelvesModel.create({ books: bookObjectIds, genre: genres });

      // save the Bookshelves document
      // await newBookshelves.save();

      return res.status(201).json({
        status: true,
        message: 'Bookshelves added successfully',
        data: newBookshelves,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },

  // read
  getBookShelves: async (req, res, next) => {
    try {
      const { bookId } = req.query;

      if (!bookId) {
        return res.status(400).json({
          status: true,
          message: 'Missing bookId query',
        });
      }

      // const bookShelvesData = await BookshelvesModel.find({
      //   books: { $in: [bookId] },
      //   // $in to find the book objectId "in"side the bookeshelves document from bookshelves endpoint
      // });

      const bookShelvesData = await BookshelvesModel.find({
        $and: [{ books: { $in: [bookId] } }, { genre: 'fantasy' }, { genre: 'middle age' }],
      });

      if (!bookShelvesData || bookShelvesData.length < 1) {
        return res.status(400).json({
          status: true,
          message: 'No data with matching ID found',
        });
      }

      return res.status(200).json({
        status: true,
        data: bookShelvesData,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },

  // update
  updateBookShelves: async (req, res, next) => {
    try {
      const { bookshelfId } = req.query;
      const { genre } = req.body;
      if (!genre) {
        return res.status(400).json({
          status: true,
          message: 'Input genre',
        });
      }

      // find the Bookshelves document by ID and update the genre using $set
      // const updatedBookshelf = await BookshelvesModel.findByIdAndUpdate(bookshelfId, { $addToSet: { genre } }, { new: true }); // ADD ELEMENT
      const updatedBookshelf = await BookshelvesModel.findByIdAndUpdate(bookshelfId, { $pull: { genre } }, { new: true }); // REMOVE ELEMENT

      if (!updatedBookshelf) {
        return res.status(404).json({ message: 'Bookshelf not found' });
      }

      return res.status(200).json({
        status: true,
        message: 'success update data',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },

  //delete
  deleteBookShelves: async (req, res, next) => {
    try {
      const { genre } = req.query;

      // Use $pull to remove the specified genre from the 'genre' array
      const result = await BookshelvesModel.deleteMany({ genre: genre });

      if (result.deletedCount > 0) {
        return res.status(200).json({
          success: true,
          message: `Bookshelves with genre '${genre}' deleted successfully.`,
        });
      } else {
        return res.status(400).json({
          status: true,
          message: 'no data to be deleted',
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
          error: error.message,
        },
      });
    }
  },
};
