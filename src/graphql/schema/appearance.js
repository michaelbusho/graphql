import { gql } from 'apollo-server-express';

export default gql`
	type Appearance {
		_id: ID!
		location: Location!
		user: User!
		createdAt: String
	}

	extend type Query {
		findUserAppearances(user_id: String!): [Appearance]
		findLocationAppearances(location_id: String!): [Appearance]
	}

	extend type Mutation {
		createAppearance(user_id: String!, location_id: String!): Appearance
		deleteAppearance(appearanceID: ID!): Appearance
	}
`;
