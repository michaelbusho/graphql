import { gql } from 'apollo-server-express';

export default gql`
	enum Roles {
		ADMIN
		DEFAULT_USER
	}

	enum HealthStatus {
		HEALTHY
		COMPROMISED
	}

	type AuthData {
		userID: ID!
		token: String!
		tokenExpiration: Int!
	}

	type User {
		_id: ID!
		rfid: String!
		role: Roles!
		permissions: [String!]!
		email: String!
		password: String
		name: String!
		lastName: String!
		health_status: HealthStatus!
		address: String
		phone_number: String
		image: String
	}

	input UserInput {
		rfid: String!
		role: Roles!
		email: String!
		password: String!
		name: String!
		lastName: String!
		health_status: HealthStatus!
		address: String
		phone_number: String
		image: String
	}

	input UserInputUpdate {
		rfid: String
		role: Roles
		email: String
		password: String
		name: String
		lastName: String
		health_status: HealthStatus
		address: String
		phone_number: String
		image: String
	}

	type Query {
		findUserByRfid(rfid: String!): User!
		users: [User]!
		login(email: String!, password: String!): AuthData!
	}

	type Mutation {
		createUser(UserInput: UserInput): User
		updateUser(userID: ID!, UserInput: UserInputUpdate): User
		deleteUser(userID: ID!): User
	}
`;
