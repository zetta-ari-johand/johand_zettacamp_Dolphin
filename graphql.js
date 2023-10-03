const { gql } = require('apollo-server-express');
const SongModel = require('./models/songModel');
const PlaylistModel = require('./models/playlistModel');
const UserModel = require('./models/UserModel');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const bcrypt = require('bcrypt');
const verifyToken = require('./helper/verifyToken');

const typeDefs = gql`
  # FIELD SNAKE CASE
  type User {
    id: ID!
    username: String!
    email: String!
    first_name: String!
    last_name: String!
    address: Address
  }

  type Address {
    country: String
    city: String
    street: String
  }

  type Song {
    id: ID!
    title: String!
    artist: String!
    genre: String!
    duration: String!
    playlistId: ID
    playlistBy: String
    playlist: Playlist
  }

  type Playlist {
    id: ID!
    name: String!
    songIds: [Song]
    songs: [Song]
  }

  # QUERY CAPITAL CASE
  type Query {
    getAllSong: [Song]
    getAllPlaylist: [Playlist]
    getAllUser: [User]
  }

  # MUTATION CAPITAL CASE
  type Mutation {
    userRegister(input: UserInput!): RegisterResponse!
    userLogin(username: String!, password: String!): LoginResponse
    createSong(input: SongInput!): Song
    createPlaylistByGenre(input: CreatePlaylistByGenreInput!): Playlist
    createPlaylistByArtist(input: CreatePlaylistByArtistInput!): Playlist
    updateSong(id: ID!, input: SongUpdate!): Song
    updatePlaylist(id: ID, input: PlaylistUpdate): Playlist
    deleteSong(id: ID): DeleteResponse!
    deletePlaylist(id: ID): DeleteResponse!
  }

  input UserInput {
    username: String!
    email: String!
    password: String!
    first_name: String!
    last_name: String!
    address: AddressInput
  }

  input AddressInput {
    country: String
    city: String
    street: String
  }

  type RegisterResponse {
    success: Boolean!
    message: String!
  }

  input SongInput {
    title: String!
    artist: String!
    genre: String!
    duration: String!
    playlistId: ID
  }

  input CreatePlaylistByGenreInput {
    name: String!
    songGenre: String!
  }
  input CreatePlaylistByArtistInput {
    name: String!
    artistName: String!
  }

  input SongUpdate {
    title: String
    artist: String
    genre: String
    duration: String
    playlistId: ID
  }

  input PlaylistUpdate {
    name: String
  }

  type DeleteResponse {
    success: Boolean!
    message: String
  }

  type LoginResponse {
    token: String
    user: User
  }
`;

const resolvers = {
  Query: {
    // GET ALL USERS
    getAllUser: async () => {
      try {
        return await UserModel.find();
      } catch (error) {
        throw new Error(error);
      }
    },
    // GET ALL SONGS
    getAllSong: async () => {
      try {
        return await SongModel.find();
      } catch (error) {
        throw new Error(error);
      }
    },
    // GET ALL PLAYLISTS
    // ! USE TOKEN
    getAllPlaylist: async (parent, args, context) => {
      try {
        const token = context.req.headers.authorization;
        verifyToken(token);

        return await PlaylistModel.find();
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    // REGISTER USER
    userRegister: async (parent, { input }) => {
      try {
        // 1.GET USERNAME EXIST OR NOT
        // 2. IF EXIST THROW ERR

        const { username, email, password, address, first_name, last_name } = input;

        const hashedPassword = await bcrypt.hash(password, 10); // 2ND PARAM IS SALT AROUND
        /**
         number of rounds used to generate the cryptographic salt that is combined with the password before hashing.
         */

        const newUser = new UserModel({
          username,
          email,
          password: hashedPassword,
          first_name,
          last_name,
          address,
        });

        // Save the new user to the database
        const savedUser = await newUser.save();

        if (savedUser) {
          return {
            success: true,
            message: 'Success register',
          };
        } else {
          return {
            success: false,
            message: 'Failed register',
          };
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    // LOGIN USER USING USERNAME AND PASSWORD
    userLogin: async (parent, { username, password }, context) => {
      try {
        // Find the user by their username address
        const user = await UserModel.findOne({ username });

        // If the user is not found or the password doesn't match, return an error
        if (!user) {
          throw new Error('User not found');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          throw new Error('Invaild username or password');
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET, {
          expiresIn: '1h',
        });

        // If authentication is successful, return the user's information
        return { user, token };
      } catch (error) {
        throw new Error(error);
      }
    },
    // CREATE SONG
    // ! USE TOKEN
    createSong: async (parent, { input }, context) => {
      try {
        const token = context.req.headers.authorization;
        verifyToken(token);

        const newSongInput = new SongModel(input);
        const saveNewSong = await newSongInput.save();

        saveNewSong.playlistId = input.playlistId;
        await saveNewSong.save();
        return saveNewSong;
      } catch (error) {
        throw new Error(error);
      }
    },
    // CREATE PLAYLIST BY GENRE
    // ! USE TOKEN
    createPlaylistByGenre: async (parent, { input }, context) => {
      try {
        const token = context.req.headers.authorization;
        verifyToken(token);

        const { songGenre, name } = input;

        // find all songs with the specified genre
        const songsWithGenre = await SongModel.find({ genre: songGenre });

        // create a new playlist with the provided name and songIds
        const newPlaylist = new PlaylistModel({
          name,
          songIds: songsWithGenre.map((song) => song._id),
        });

        // save the new playlist
        const savedPlaylist = await newPlaylist.save();

        // update songs that just added, updated field is playlistId and playlistBy
        if (savedPlaylist) {
          await SongModel.updateMany(
            {
              _id: { $in: newPlaylist.songIds },
            },
            { playlistId: newPlaylist._id, playlistBy: 'Genre' }
          );
        }

        return savedPlaylist;
      } catch (error) {
        throw new Error(error);
      }
    },
    // CREATE PLAYLIST BY ARTIST
    // ! USE TOKEN
    createPlaylistByArtist: async (parent, { input }, context) => {
      try {
        const token = context.req.headers.authorization;
        verifyToken(token);

        const { artistName, name } = input;

        // find all songs by the specified artist
        const songsByArtist = await SongModel.find({ artist: artistName });

        if (!songsByArtist.length) {
          throw new Error('No song with artist found in song list');
        }

        // create a new playlist with the provided name and songIds
        const newPlaylist = new PlaylistModel({
          name,
          songIds: songsByArtist.map((song) => song._id),
        });

        // save the new playlist
        const savedPlaylist = await newPlaylist.save();

        // update field playlistId and playlistBy in song model
        if (savedPlaylist) {
          await SongModel.updateMany(
            {
              _id: { $in: newPlaylist.songIds },
            },
            { playlistId: newPlaylist._id, playlistBy: 'Artist' }
          );
        }

        return savedPlaylist;
      } catch (error) {
        throw new Error(error);
      }
    },
    // UPDATE SONG INFO / FIELD BY ID
    // ! USE TOKEN
    updateSong: async (parent, { id, input }, context) => {
      try {
        const token = context.req.headers.authorization;
        verifyToken(token);

        const updatedSong = await SongModel.findByIdAndUpdate(
          id,
          input,
          { new: true } // Return the updated document
        );

        if (!updatedSong) {
          throw new Error(`Song with ID ${id} not found.`);
        }

        return updatedSong;
      } catch (error) {
        throw new Error(`Error updating Song: ${error.message}`);
      }
    },
    // UPDATE PLAYLIST BY ID
    // ! USE TOKEN
    updatePlaylist: async (parent, { id, input }, context) => {
      try {
        const token = context.req.headers.authorization;
        verifyToken(token);

        const updatePlaylist = await PlaylistModel.findByIdAndUpdate(
          id,
          input,
          { new: true } // Return the updated document
        );

        if (!updatePlaylist) {
          throw new Error(`Playlist with ID ${id} not found.`);
        }

        return updatePlaylist;
      } catch (error) {
        throw new Error(`Error updating Playlist: ${error.message}`);
      }
    },
    // DELETE SONG BY ID
    // ! USE TOKEN
    deleteSong: async (parent, { id }, context) => {
      try {
        const token = context.req.headers.authorization;
        verifyToken(token);

        const deleteData = await SongModel.findByIdAndRemove(id);
        if (deleteData) {
          return {
            success: true,
            message: 'success delete song',
          };
        } else {
          return {
            success: false,
            message: 'Song ID not exist',
          };
        }
      } catch (error) {
        return new Error(error);
      }
    },
    // DELETE PLAYLIST BY ID
    // ! USE TOKEN
    deletePlaylist: async (parent, { id }, context) => {
      try {
        const token = context.req.headers.authorization;
        verifyToken(token);

        const deleteData = await PlaylistModel.findByIdAndRemove(id);
        if (deleteData) {
          return {
            success: true,
            message: 'success delete playlist',
          };
        } else {
          return {
            success: false,
            message: 'Playlist ID not exist',
          };
        }
      } catch (error) {
        return new Error(error);
      }
    },
  },

  // TO GET PLAYLIST INFO INSIDE SONG DOCUMENT
  Song: {
    playlist: async (parent, args, context) => {
      //   const playlistId = parent.playlistId;

      // if playlistId is null, return null directly

      if (parent.playlistId) {
        return await context.playlistLoader.load(playlistId);
      }

      //   if (playlistId === null) {
      return null;
      //   }

      // use DataLoader to efficiently load the associated playlist
      //   const playlist = await context.playlistLoader.load(playlistId);

      //   return playlist;
    },
  },
  // TO GET [SONGS] INFO INSIDE PLAYLIST
  Playlist: {
    songs: async (parent, args, context) => {
      // use DataLoader to efficiently load songs by their IDs
      const songs = await context.songLoader.loadMany(parent.songIds);
      return songs;
    },
  },
};

module.exports = { typeDefs, resolvers };
