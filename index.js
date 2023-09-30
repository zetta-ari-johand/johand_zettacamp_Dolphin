require('dotenv').config();
const express = require('express');
/**
GRAPH:
 * Query Language & runtime for APIs 
 * Flexible Data Fetching
 * Single Endpoint
 * Strongly Typed Schema
    This schema serves as a contract between clients and the server, specifying the types of data that can be queried and manipulated.
 * Real-time and Batch Queries
    It is well-suited for applications requiring live updates and complex data retrieval.


APOLLO SERVER EXPRESS:
  JavaScript library that allows you to build GraphQL APIs using the Express.js framework.
  part of the Apollo GraphQL ecosystem
  can define your GraphQL schema, resolvers, and other server-related functionality
  also offers features like data caching, error handling, and subscriptions
 */
const { ApolloServer, gql } = require('apollo-server-express'); // import component from apollo server express
/* 
apolloserver:
class provided by apollo server
used to create and configure apollo server instance
responsible for handling queries and mutation.

gql:
function from apollo server to defining graphql schema using graphql schema language
use it to write your type definitions and queries/mutations in a more concise and readable way
parses your schema definitions into a format that Apollo Server can work with
*/
const { makeExecutableSchema } = require('graphql-tools');
/* 
function used to create an executable GraphQL schema by combining your type definitions and resolver functions. 
it takes two arguments: typedef and resolvers
*/
const { applyMiddleware } = require('graphql-middleware');
/**
function to intercept and modify the execution of GraphQL operations (queries and mutations) before they reach the resolvers
middleware can be used for various purposes, ex: authentication, authorization, logging, and data validation
 */
const { typeDefs, resolvers } = require('./graphql'); // import type definitions and resolvers
const checkAuth = require('./middleware/jwtAuth');
const app = express();
const port = process.env.PORT || 4000;
const mongoose = require('mongoose');
const config = require('./config/db.json');

const executableSchema = makeExecutableSchema({ typeDefs, resolvers });
/**
create a complete GraphQL schema that is executable
this schema includes the logic for how to resolve queries and mutations defined in typeDefs
executableScema holds this combined schema, used it to set up GraphQL server with Apollo Server server library.
 */
const protectedSchema = applyMiddleware(executableSchema);
/**
applies middleware to your executable GraphQL schema, resulting in a new schema with the specified middleware functions applied
*/

// set up apollo server instance to handle GraphQL queries and mutations using the protectedSchema
const server = new ApolloServer({
  schema: protectedSchema,
  context: (req) => ({
    req: req.req,
  }),
});

// TRY TO USE JWT
// const server = new ApolloServer({
//   schema: protectedSchema,
//   context: ({ req }) => {
//     // Apply the checkAuth middleware to secure your GraphQL endpoint
//     checkAuth(req);

//     // Add the user information to the context if needed
//     const user = req.user; // You can access the user information decoded from the JWT here
//     return { user };
//   },
// });

// run graphql server and by default API for graphql is available at localhost{port}/graphql
server.applyMiddleware({ app });

// connect to mongodb
mongoose
  .connect(config.mongoURI, {
    // URI = MongoDB Uniform Resource Identifier
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to mongoDB');
  })
  .catch((error) => {
    console.log('error connect to mongoDB', error);
  });

// import router
const indexRouter = require('./router/indexRouter');

//parses incoming HTTP requests with JSON
app.use(express.json());

//router
app.use(indexRouter);

//healthcheck
app.get('/healthcheck', (req, res) => {
  res.send(true);
});

app.listen(port, () => {
  console.log(`port is running at ${port}`);
});
