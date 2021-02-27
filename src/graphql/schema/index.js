import { gql } from 'apollo-server-express';

const typeDefs = gql`
	type Location {
		_id: ID!
		name: String!
		# capacity: Int!
		# createdAt: String!
		# address: String
		# phone_number: String
		# email: String
		# description: String
	}

	type User {
		_id: ID!
		rfid: String!
		role: String!
		permissions: [String!]!
		email: String!
		password: String
		# name: String!
		# lastName: String!
		# health_status: String!
		# email: String!
		# username: String!
		# password: String!
		# created_at: String!
		# address: String
		# phone_number: String
		image: String
	}

	scalar Date
	type Appearance {
		_id: ID!
		location: Location!
		user: User!
		time_stamp: Date!
	}

	#user
	input UserInput {
		rfid: String!
		role: String!
		email: String!
		password: String!
		image: String
	}

	type Query {
		users: [User!]!
	}

	type Mutation {
		createUser(UserInput: UserInput): User
	}
`;

export default typeDefs;
