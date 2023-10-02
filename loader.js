const DataLoader = require('dataloader');
const BookPurchaseModel = require('./models/bookModel');
const AuthorModel = require('./models/authorModel');

/*
DataLoader is a generic utility library used in GraphQL servers to be used as part of your application's data fetching layer 
to provide a simplified and consistent API over various remote data sources 
such as databases or web services via batching and caching

DataLoader is a general-purpose data-fetching tool that can be used in various contexts,
while Populate is specific to Mongoose and MongoDB and is used for handling relationships between documents in a MongoDB database
*/

const getBookShelf = async function (bookIds) {
  const bookLists = await BookPurchaseModel.find({
    //fetches a list of books from a database
    _id: {
      $in: bookIds,
    },
  });

  const bookMap = {}; // will be used to map book IDs to their corresponding book objects

  bookLists.forEach((book) => {
    /**
     iterates through the bookLists array, which contains the books fetched from the database
     for each book in the list, it adds an entry in the bookMap object, where the key is the book's _id and the value is the entire book object
     */
    bookMap[book._id] = book;
    /**
      this line returns an array of books in the same order as the provided bookIds array
      uses the map function to transform each book ID in the bookIds array into the corresponding book object from the bookMap
      the result is an array of book objects that matches the order of the input bookIds
     */
  });
  return bookIds.map((id) => bookMap[id]);
  /**
   initializes a new DataLoader instance called bookLoader
   it's configured with the getBookShelf function, which is the batch loading function defined earlier
   */
};
const bookLoader = new DataLoader(getBookShelf);

const authorLoader = new DataLoader(async (authorIds) => {
  // Load authors based on provided authorIds
  const authors = await AuthorModel.find({ _id: { $in: authorIds } });
  const authorMap = {};
  authors.forEach((author) => {
    authorMap[author._id] = author;
  });
  return authorIds.map((authorId) => authorMap[authorId]);
});

module.exports = { bookLoader, authorLoader };
