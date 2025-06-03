import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from './resolvers';
const typeDefs = `
  type User {
    id: String!
    email: String!
    name: String!
    createdAt: String!
    updatedAt: String!
    permissions: [String!]
  }

  type Query {
    users: [User!]!
    user(id: String!): User
    me: User
  }

  type Mutation {
    createUser(email: String!, name: String!): User!
    updateUser(id: String!, email: String, name: String): User!
    deleteUser(id: String!): Boolean!
  }
`;

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
