// const { gql } = require('apollo-server-express');

// const typeDefs = gql`
//   type Query {
//     hello: String
//   }
// `;

// const resolvers = {
//   Query: {
//     hello: () => 'Hello, world!',
//   },
// };

// module.exports = { typeDefs, resolvers };

const { gql } = require('apollo-server-express');
const AuthorModel = require('./models/authorModel'); // import the Author model
const BookPurchaseModel = require('./models/bookModel'); // import the BookPurchase model
const BookshelvesModel = require('./models/bookShelvesModel'); // import the Bookshelves model
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

/**
name of type must be unique
name does not tied to other data, so can named it whatever 
*/
const dummyUsers = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
];

const typeDefs = gql`
  # type: define the structure of the object that will used as the return response
  type Author {
    id: ID!
    name: String!
    email: String!
    socialMedia: SocialMedia
  }

  type SocialMedia {
    instagram: String
    x: String
    reddit: String
  }

  type BookPurchase {
    id: ID!
    bookTitle: String!
    author: Author
    genre: String!
    price: Float!
    quantity: Int
    status: Boolean
    stock: Int
    bookId: ID
  }

  type Bookshelves {
    id: ID!
    books: [BookPurchase]
    genre: [String]
  }

  type Query {
    # nameQuery(argument): return type (if inside arr, return arr obj)
    getAuthorById(id: ID!): Author
    getAllAuthors: [Author]
    getBookPurchaseById(id: ID!): BookPurchase
    getAllBookPurchases: [BookPurchase]
    getBookshelfById(id: ID!): Bookshelves
    getBookShelves: [Bookshelves]
  }

  # mutation is a GraphQL Operation that allows to insert new data or modify the existing data on the server-side.
  # can think of GraphQL Mutations as the equivalent of POST , PUT , PATCH and DELETE requests in REST.
  type Mutation {
    createBook(input: BookInput!): BookPurchase!
    createMultipleBook(input: [BookInput!]): [BookPurchase]!
    updateBook(id: ID!, input: BookUpdate!): BookPurchase
    deleteBook(id: ID!): BookPurchase
    deleteBooksByGenre(genre: String!): DeleteBooksResponse!
    login(username: String!, password: String!): TokenResponse!
  }

  # input: define the strucuture of data tah can be only used as argument
  input BookInput {
    bookTitle: String!
    author: ID! # accept author's ID as input
    genre: String!
    price: Float!
    quantity: Int
    status: Boolean
  }

  input BookUpdate {
    bookTitle: String
    author: ID # accept author's ID as input
    genre: String
    price: Float
    quantity: Int
  }

  type DeleteBooksResponse {
    success: Boolean!
    message: String
  }

  type TokenResponse {
    token: String
  }
`;

const resolvers = {
  Query: {
    // get author by id
    getAuthorById: async (parent, { id }) => {
      try {
        const author = await AuthorModel.findById(id);
        return author;
      } catch (error) {
        throw new Error(`Error fetching author: ${error.message}`);
      }
    },

    //get all author
    getAllAuthors: async () => {
      try {
        const authors = await AuthorModel.find();
        return authors;
      } catch (error) {
        throw new Error(`Error fetching authors: ${error.message}`);
      }
    },

    // get book purchase by id
    getBookPurchaseById: async (parent, { id }) => {
      try {
        const bookPurchase = await BookPurchaseModel.findById(id);
        return bookPurchase;
      } catch (error) {
        throw new Error(`Error fetching book purchase: ${error.message}`);
      }
    },

    // get all book
    getAllBookPurchases: async () => {
      try {
        const bookPurchases = await BookPurchaseModel.find();
        return bookPurchases;
      } catch (error) {
        throw new Error(`Error fetching book purchases: ${error.message}`);
      }
    },

    // get book shelf by id
    getBookshelfById: async (parent, { id }) => {
      try {
        const bookshelf = await BookshelvesModel.findById(id);
        return bookshelf;
      } catch (error) {
        throw new Error(`Error fetching bookshelf: ${error.message}`);
      }
    },

    // get all bookshelves
    getBookShelves: async () => {
      try {
        const bookShelves = await BookshelvesModel.find();
        return bookShelves;
      } catch (error) {
        throw new Error(`Error fetching book purchases: ${error.message}`);
      }
    },
  },
  Mutation: {
    // ADD BOOK
    createBook: async (parent, { input }) => {
      try {
        // Create a new book purchase record
        const newBookPurchase = new BookPurchaseModel(input);

        // Save the new book purchase
        const savedBookPurchase = await newBookPurchase.save();

        /**
         // to associate this book purchase with an author,
         // the author field to the author's ID
         // make sure to have the 'author' field in the input 
         */
        savedBookPurchase.author = input.author;
        await savedBookPurchase.save();
        return savedBookPurchase;
      } catch (error) {
        throw new Error(`Error creating book purchase: ${error.message}`);
      }
    },

    createMultipleBook: async (parent, { input }) => {
      try {
        const createManyBook = await BookPurchaseModel.insertMany(input);
        return createManyBook;
      } catch (error) {
        throw new Error(`Error creating books: ${error.message}`);
      }
    },

    // UPDATE BOOK
    updateBook: async (parent, { id, input }) => {
      try {
        const updatedBook = await BookPurchaseModel.findByIdAndUpdate(
          id,
          input,
          { new: true } // Return the updated document
        );

        if (!updatedBook) {
          throw new Error(`Book with ID ${id} not found.`);
        }

        return updatedBook;
      } catch (error) {
        throw new Error(`Error updating book: ${error.message}`);
      }
    },

    // DELETE BOOK
    deleteBook: async (parent, { id }) => {
      try {
        const deletedBook = await BookPurchaseModel.findByIdAndDelete(id);
        return deletedBook;
      } catch (error) {
        throw new Error(`Error deleting book: ${error.message}`);
      }
    },

    deleteBooksByGenre: async (parent, { genre }) => {
      try {
        const deleteBooks = await BookPurchaseModel.deleteMany({ genre });
        return {
          success: true,
          message: `Success delete ${deleteBooks.deletedCount} books with genre ${genre}`,
        };
      } catch (error) {
        throw new Error(`Error deleting book: ${error.message}`);
      }
    },

    login: async (parent, { username, password }) => {
      // perform authentication logic
      const user = dummyUsers.find((user) => user.username === username && user.password === password);

      if (!user) {
        // If authentication fails, you can throw an error
        throw new Error('Invalid username or password');
      }

      // If authentication is successful, generate a JWT token
      const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

      return { token };
    },
  },

  /**
    these resolver functions are associated with specific fields within your types
    responsible for determining how to fetch or compute the data for those fields
    defined globally for their respective types and are used whenever the associated fields are requested within any query or mutation
   */
  Author: {
    async socialMedia(author) {
      return author.socialMedia || {};
      // it applies whenever the socialMedia field is requested in any query or mutation involving the Author type
    },
  },

  BookPurchase: {
    // name must match with the one in typedef
    async author(bookPurchase) {
      try {
        // it applies whenever the author field is requested in any query or mutation involving the BookPurchase type
        const author = await AuthorModel.findById(bookPurchase.author);
        return author;
      } catch (error) {
        throw new Error(`Error fetching author: ${error.message}`);
      }
    },
  },
};

module.exports = { typeDefs, resolvers };
