import { gql } from 'apollo-server-express';

export default gql`
	type Appearance {
		_id: ID!
		location: Location!
		user: User!
	}

	extend type Query {
		appearances: [Appearance]
		findAppearanceByUser(user_id: String!): Appearance
		findAppearanceByLocation(location_id: String!): Appearance
	}

	extend type Mutation {
		createAppearance(user_id: String!, location_id: String!): Appearance
	}
`;
