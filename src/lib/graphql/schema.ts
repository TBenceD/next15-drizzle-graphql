import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from './resolvers';
const typeDefs = `
  type User {
    id: String!
    email: String!
    name: String!
    posts: [Post!]!
    createdAt: String!
    updatedAt: String!
  }

  type Post {
    id: String!
    title: String!
    content: String
    authorId: String!
    author: User!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    users: [User!]!
    user(id: String!): User
    posts: [Post!]!
    post(id: String!): Post
  }

  type Mutation {
    createUser(email: String!, name: String!): User!
    updateUser(id: String!, email: String, name: String): User!
    deleteUser(id: String!): Boolean!
    
    createPost(title: String!, content: String, authorId: String!): Post!
    updatePost(id: String!, title: String, content: String): Post!
    deletePost(id: String!): Boolean!
  }
`;

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
