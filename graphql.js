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
