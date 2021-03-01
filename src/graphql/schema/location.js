import { gql } from 'apollo-server-express';

export default gql`
	type Location {
		_id: ID!
		name: String!
		capacity: Int!
		address: String
		phone_number: String
		email: String
		description: String
	}

	input LocationInput {
		name: String!
		capacity: Int!
		address: String
		phone_number: String
		email: String
		description: String
	}

	extend type Query {
		locations: [Location]
		findLocationById(location_id: String!): Location
	}

	extend type Mutation {
		createLocation(LocationInput: LocationInput): Location
	}
`;
