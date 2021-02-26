import { gql } from "apollo-server-express";

export const typeDefs = gql`
    type Location {
        id: ID!
        name: String!,
        capacity: Int!,
        createdAt:  String!,
        address: String,
        phone_number: String,
        email: String,
        description: String
    }

    type Person {
        id: ID!
        rfid: String!,
        name: String!,
        lastName: String!,
        health_status: String!,
        email: String!,
        username: String!,
        password: String!,
        created_at: String!,
        address: String,
        phone_number: String,
        image: String
    }

    type Query {
        hello: String!
        cats: [Cat!]!
    }

    type Cat {
        id: ID!
        name: String!
    }

    type Mutation {
        createCat(name: String!): Cat!
    }
`;