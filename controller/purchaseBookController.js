const mongoose = require('mongoose');
const BookPurchaseModel = require('../models/bookModel');
const AuthorModel = require('../models/authorModel');
const BookshelvesModel = require('../models/bookShelvesModel');

const bookPurchaseList = [];

const randomNumber = Math.floor(Math.random() * 11);

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
  // DAY 6
  // findBook: async (req, res, next) => {
  //   try {
  //     // find book by id
  //     // const { id } = req.query;
  //     // if (!id) {
  //     //   return res.status(422).json({
  //     //     status: false,
  //     //     message: 'Insert id of books',
  //     //   });
  //     // }
  //     // if (!mongoose.Types.ObjectId.isValid(id)) {
  //     //   return res.status(400).json({ message: 'Invalid ObjectId format' });
  //     // }

  //     // const bookData = await BookPurchaseModel.findById(id).populate('author');

  //     // find all
  //     // const bookData = await BookPurchaseModel.find();
  //     // .populate('author');
  //     // to populate certain data that already has relationship

  //     // DAY 5 AGGREGATE

  //     const { maxPrice } = req.body;
  //     if (!maxPrice) {
  //       return res.status(400).json({
  //         status: true,
  //         message: 'input max price ya plis aku capek ingetin',
  //       });
  //     }

  //     const bookData = await BookPurchaseModel.aggregate([
  //       {
  //         /*
  //         filter document
  //         similiar to find
  //         filter based on specified criteria
  //         used at beginning pipeline
  //         */
  //         $match: {
  //           $and: [
  //             { price: { $lte: maxPrice } }, // first condition
  //             { status: false }, // second condition
  //           ],
  //         },
  //       },
  //       {
  //         /*
  //         performing a left outer join
  //         let you combine document
  //         specify source, local, foreign, alias
  //         useful to enrich your document with info from another collection
  //         */
  //         $lookup: {
  //           from: 'authors', // collection source (left)
  //           localField: 'author', // local key (right)
  //           foreignField: '_id', // foreign key or something like the relation keyword (join)
  //           as: 'authorInfo', // save the lookup data as the new field with name "as:"
  //         },
  //       },
  //       /*
  //       add new fields
  //       usefull when want to create new fields
  //       specify new fields
  //       original unchange
  //       */
  //       {
  //         $addFields: {
  //           /*
  //           to concatenate string from different field or literal
  //           helpful to combine and create new string
  //           provide value to concate
  //           */
  //           titleWithAuthorAndGenre: { $concat: ['$bookTitle', ' by ', { $arrayElemAt: ['$authorInfo.name', 0] }, ' - ', '$genre'] },
  //           /*
  //            $arrayElemAt used to extract an element from an array. In this case, it's extracting the first element (element at index 0) from the array
  //            behavior: designed to work with an array but work a single value (treating it as a single element of array). thats why using 0
  //           */
  //           isForSale: true,
  //           isDisount: {
  //             $cond: {
  //               if: { $lte: ['$price', 75000] },
  //               then: 'THIS BOOK ON DISCOUNT',
  //               else: 'sorry this book is not on discount',
  //             },
  //           },
  //         },
  //       },
  //       /*
  //       reorder document
  //       allow to sort document by 1 or more field (asc / desc)
  //       can specify sorting criteria
  //       useful for ordering the result
  //       */
  //       { $sort: { price: 1 } },
  //       // { $sort: { 'authorInfo.name': 1 } },

  //       /*
  //       reshaping,
  //       in, ex
  //       can create computed fields
  //       help in selecting
  //       */
  //       {
  //         $project: {
  //           bookTitle: 1,
  //           author: 1,
  //           price: 1,
  //           isForSale: 1,
  //           isDiscount: 1,
  //           isDisount: 1,
  //           titleWithAuthorAndGenre: 1,
  //         },
  //       },
  //     ]);

  //     // validation if theres no data exisiting
  //     if (bookData.length < 1) {
  //       return res.status(200).json({
  //         status: true,
  //         message: 'Theres no book. create first',
  //       });
  //     }
  //     // console.log(bookData.length); // 7

  //     return res.status(200).json({
  //       status: true,
  //       message: 'Success get book data',
  //       data: bookData,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({
  //       status: false,
  //       data: {
  //         message: 'nganu, ada error. semoga pesan2 dibawah ini bisa membantu',
  //         error: error.message,
  //       },
  //     });
  //   }
  // },

  // SO FAR THIS IS THE MOST COMPLETE
  findBook: async (req, res, next) => {
    try {
      const { maxPrice, page, perPage } = req.body;
      if (!maxPrice) {
        return res.status(400).json({
          status: true,
          message: 'Input max price is required',
        });
      }

      const pipeline = [
        {
          $match: {
            $and: [{ price: { $lte: maxPrice } }],
          },
        },
        {
          $lookup: {
            from: 'authors',
            localField: 'author',
            foreignField: '_id',
            as: 'authorInfo',
          },
        },
        {
          $project: {
            // 'books._id': 0,
            'books.books.author': 0,
            'books.books.createdAt': 0,
            'books.books.updatedAt': 0,
            'books.books.__v': 0,
            'books.books.authorInfo.socialMedia': 0,
            'books.books.authorInfo.createdAt': 0,
            'books.books.authorInfo.updatedAt': 0,
            'books.books.authorInfo.__v': 0,
          },
        },
        {
          $sort: { _id: -1 }, // Sort by price in descending order
        },
        {
          /*
          facet:
          perform multiple operations within a single aggregation pipeline.
          used where you need to perform different transformations or calculations on the same set of data.
          ex: 
          $facet to simultaneously calculate statistics (ex., average, sum) and filter data in a single aggregation query.
          */
          $facet: {
            /*
            group:
            groups documents in the pipeline by one or more fields and performs aggregations
            separates documents into groups according to a "group key". The output is one document for each unique group key.
            used for summarizing data or calculating aggregate values based on grouping criteria.
            Helpful when you want to perform operations like counting, summing,
            */
            totalCount: [{ $group: { _id: null, count: { $sum: 1 } } }],
            books: [{ $skip: page * perPage }, { $limit: perPage }],
            /*
            skip:
            skip a specified number of documents (records) in the input pipeline.
            Useful for implementing pagination
            Helps avoid returning all data at once,
            */
            /*
           limit:
           limit the number of documents (records) that pass through the pipeline.
           Used in conjunction with $skip for implementing pagination 
           Helps control the size of the result set and improve query performance.
           */
          },
        },
        {
          $project: {
            books: '$books',
            totalBooks: { $arrayElemAt: ['$totalCount.count', 0] },
          },
        },

        // {
        //   $unwind: '$totalCount', // Unwind the totalCount array
        // },
      ];

      const bookData = await BookPurchaseModel.aggregate(pipeline);

      if (!bookData.length) {
        return res.status(200).json({
          status: true,
          message: 'No books found. Please create some books.',
        });
      }

      return res.status(200).json({
        status: true,
        message: 'Success getting book data',
        data: {
          books: bookData[0].books,
          totalCount: bookData[0].totalBooks,
          currentPage: page,
          totalPage: Math.ceil(bookData[0].totalBooks / perPage),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        data: {
          message: 'An error occurred. Check the error message below for details.',
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

      const booksWithPrice = bookObjectIds.map((bookId) => ({ bookId, price: 0, stock: Math.floor(Math.random() * 11) }));

      // retrieve genres from BookPurchase
      const genres = await BookPurchaseModel.distinct('genre');

      // create a new Bookshelves document
      const newBookshelves = await BookshelvesModel.create({ books: booksWithPrice, genre: genres });

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
      /* DAY 4 ELEMMATCH
      const { bookId } = req.query;
      const { minPrice, maxStock } = req.body;
      // const { genres } = req.body;

      if (!bookId) {
        return res.status(400).json({
          status: true,
          message: 'Missing bookId query',
        });
      }

      const query = {
        books: {
          $elemMatch: {
            bookId: bookId,
            price: { $gte: minPrice }, // Match books with price greater than or equal to 5000
            stock: { $lte: maxStock },
          },
        },
      };

      const bookShelvesData = await BookshelvesModel.find(query);
      */

      // const bookShelvesData = await BookshelvesModel.find({
      //   // books: mongoose.Types.ObjectId(bookId),
      //   // books: {
      //   //   $elemMatch: {
      //   //     genre: 'fiction',
      //   //   },
      //   // },
      // }).select('books genre createdAt updatedAt');

      // const filteredBookshelves = await BookshelvesModel.find({
      //   books: {
      //     $elemMatch: {
      //       _id: mongoose.Types.ObjectId(bookId),
      //       // Add more conditions as needed
      //     },
      //   },
      // });

      // find data by bookId
      // const bookShelvesData = await BookshelvesModel.find({
      //   books: { $in: [bookId] },
      //   // $in to find the book objectId "in"side the bookeshelves document from bookshelves endpoint
      // });

      // const bookShelvesData = await BookshelvesModel.find({
      //   $and: [{ books: { $in: [bookId] } }, { genre: 'fantasy' }, { genre: 'middle age' }],
      // });

      // if (!bookShelvesData || bookShelvesData.length < 1) {
      //   return res.status(400).json({
      //     status: true,
      //     message: 'No data with matching ID found',
      //   });
      // }

      const bookShelvesData = await BookshelvesModel.aggregate([
        {
          $unwind: '$books',
        },
        {
          $match: {
            'books.stock': { $lte: 5 }, // filter documents where stock is less than or equal to 5
          },
        },
        {
          $lookup: {
            from: 'bookpurchases', // replace with the actual name of your "Books" collection
            localField: 'books.bookId',
            foreignField: '_id',
            as: 'booksInfo',
          },
        },
        {
          $lookup: {
            from: 'authors',
            localField: 'booksInfo.author',
            foreignField: '_id',
            as: 'authorInfo',
          },
        },
        {
          $addFields: {
            authorName: { $arrayElemAt: ['$authorInfo.name', 0] },
          },
        },
        {
          $project: {
            'booksInfo.quantity': 0,
            'booksInfo.__v': 0,
            __v: 0,
            'booksInfo.authorName': 0,
          },
        },
        {
          $addFields: {
            'booksInfo.authorName': '$authorName', // Merge authorName into the booksInfo object
          },
        },
        {
          $sort: { 'books.stock': 1 },
        },
        {
          $project: {
            authorName: 0, // exclude authorName from the result
            authorInfo: 0,
          },
        },
      ]);

      if (!bookShelvesData || bookShelvesData.length === 0) {
        return res.status(404).json({
          stats: true,
          message: 'No matching bookshelves found',
        });
      }

      return res.status(200).json({
        bookShelvesData,
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
      const { bookshelfId, bookIdToUpdate } = req.query;
      const { newPrice, maxStock } = req.body;

      if (!bookshelfId || !bookIdToUpdate || newPrice === undefined) {
        return res.status(400).json({
          status: false,
          message: 'Invalid input data',
        });
      }

      const filter = { _id: bookshelfId }; // define the filter criteria based on bookshelfId

      const update = {
        $set: { 'books.$[book].price': newPrice },
      };
      const arrayFilters = [
        {
          'book.bookId': bookIdToUpdate,
          'book.stock': { $lte: maxStock },
        },
      ]; // filter which element that want to be changed

      // find the Bookshelves document by ID and update the genre using $set
      // const updatedBookshelf = await BookshelvesModel.findByIdAndUpdate(bookshelfId, { $addToSet: { genre } }, { new: true }); // ADD ELEMENT
      // const updatedBookshelf = await BookshelvesModel.findByIdAndUpdate(bookshelfId, { $pull: { genre } }, { new: true }); // REMOVE ELEMENT
      // const updatedBookshelf = await BookshelvesModel.findByIdAndUpdate(
      //   bookshelfId,
      //   { $addToSet: { genre: { $each: genre } } },
      //   { new: true }
      // ); // $each

      /* 
      add to set is like distinct, the value added will be checked first 
      push  is just pushing so the value can be multiple
      each is add multiple value
      /*

      /* 
      $pop: Removes the first or last element from an array.
      { $pop: { arrayField: 1 } } // Removes the last element
      { $pop: { arrayField: -1 } } // Removes the first element
      */

      const updatedBookshelf = await BookshelvesModel.updateOne(filter, update, { arrayFilters, new: true });
      console.log(updatedBookshelf);
      if (!updatedBookshelf) {
        return res.status(404).json({
          status: true,
          message: 'Bookshelf not found',
        });
      }

      return res.status(200).json({
        status: true,
        message: 'success update data',
        data: updatedBookshelf,
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
